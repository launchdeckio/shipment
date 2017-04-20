'use strict';

const Shipment = require('./../lib/Shipment');
const Action   = require('./../lib/Action');

require('./support/index');

const testShipment = require('./fixtures/testShipment');

const sinon    = require('sinon');
const Bluebird = require('bluebird');
const execa    = require('execa');
const path     = require('path');
const request  = require('supertest');
const ursa     = require('ursa');

describe('Shipment', () => {

    /**
     * Return a fluent assertion builder for the complete execa result of a call to testcli with the given args
     * @param {String[]} args
     * @param {Boolean} allowError
     * @returns {Function}
     */
    const resultOf = (args, allowError = false) => {
        let promise = execa('node', [path.join(__dirname, 'fixtures/testCli.js')].concat(args));
        if (allowError) promise = promise.catch(error => error);
        return promise;
    };

    /**
     * Return a fluent assertion builder for the stdout buffer of a call to testcli with the given args
     * @param {String[]} args
     * @param {Boolean} allowError
     * @returns {Function}
     */
    const stdoutOf = (args, allowError = false) => {
        let builder    = resultOf(args, allowError).should.eventually.have.property('stdout');
        builder.should = builder;
        return builder;
    };

    let actionSpy, shipment;

    beforeEach(() => {

        actionSpy = sinon.spy();

        shipment = testShipment(actionSpy);
    });

    describe('transformActions', () => {

        it('should allow an associative array of action name => action pairings', () => {

            let shipment = Shipment.transformActions({
                someAction:  () => null,
                otherAction: class NotTheSameName extends Action {

                             }
            });

            shipment[0].getName().should.equal('some-action');
            shipment[1].getName().should.equal('other-action');
        });

        it('should throw if it cannot resolve the name of any of the actions', () => {

            (() => Shipment.transformActions([
                () => null,
            ])).should.throw();

            (() => Shipment.transformActions({
                someAction: () => null
            })).should.not.throw();
        });
    });

    describe('cli', () => {

        let CustomShipment, customShipment, mockPkg, updateNotifierSpy;

        beforeEach(() => {

            updateNotifierSpy             = sinon.spy();
            mockPkg                       = {version: '1.4'};
            CustomShipment                = class extends Shipment {
            };
            CustomShipment.updateNotifier = options => {
                return {
                    notify: () => updateNotifierSpy(options.pkg)
                };
            };
            const customAction            = () => null;
            customShipment                = new CustomShipment({customAction}, {pkg: mockPkg});
        });

        it('should execute the requested action', () => {

            actionSpy.should.not.have.been.called;

            shipment.cli(['do-something']);

            // Because there is no way to intercept the control flow when issuing subcommands via yargs
            // Could also use an eventemitter architecture
            return Bluebird.delay(20).then(() => {

                actionSpy.should.have.been.calledOnce;
                let action = actionSpy.firstCall.args[0];
                action.should.be.an.instanceOf(Action);
                action.getName().should.equal('do-something');
            });
        });

        it('should invoke updateNotifier', () => {

            customShipment.cli(['custom-action']);
            updateNotifierSpy.should.have.been.calledWith(mockPkg);
        });

        it('...unless noUpdateNotifier is given', () => {

            let customShipment = new CustomShipment([], {pkg: mockPkg, noUpdateNotifier: true});
            customShipment.cli(['custom-action']);
            updateNotifierSpy.should.not.have.been.called;
        });

        describe('subcommand', () => {

            it('should output the return value of "run"', () => {

                return stdoutOf(['do-something']).should.have.string('did something');
            });
        });

        describe('subcommand with input arguments', () => {

            it('should take input arguments', () => {

                return stdoutOf(['to-upper', '--message', 'very very cool message']).should.have.string('VERY VERY COOL MESSAGE');
            });
        });

        describe('subcommand that throws', () => {

            it('should print the error message', () => {

                return stdoutOf(['fail'], true).should.have.string('something went awfully wrong');
            });

            it('should have a non-zero exitcode', () => {

                return resultOf(['fail']).catch(error => {
                    error.should.have.property('code').that.is.not.equal(0);
                    return 'ok';
                }).should.eventually.equal('ok');
            });
        });

        describe('--help', () => {

            it('should print the subcommands', () => {

                return stdoutOf(['--help']).should
                    .have.string('do-something').and
                    .have.string('do-something-else').and
                    .have.string('fail');
            });
        });

        describe('--version', () => {

            it('should print a version number', () => {

                return stdoutOf(['--version']).should.match(/\d[0-9.]+/);
            });
        });
    });

    describe('api', () => {

        it('should return an object', () => {

            shipment.api().should.be.an('object');
        });

        it('should expose the actions as functions on the returned object', () => {

            let api = shipment.api();
            api.doSomething.should.be.a('function');
            api.doSomethingElse.should.be.a('function');
        });

        it('should invoke the correct action runners upon calling the corresponding function on the api object', () => {

            actionSpy.should.not.have.been.called;
            return shipment.api().doSomethingElse().then(() => {
                actionSpy.should.have.been.calledOnce;
                let action = actionSpy.firstCall.args[0];
                action.getName().should.equal('do-something-else');
            });
        });

        it('should return a promise for the return value of the action', () => {

            shipment.api().returnValue().should.eventually.equal('some return value');
        });

        it('should reject if the action throws', () => {

            shipment.api().fail().should.be.rejected;
        });
    });

    /**
     * High level server tests
     * Low-level (e.g. route creation) should go in ShipmentServer suite
     */
    describe('serve', () => {

        let server;

        beforeEach(() => {

            server = shipment.serve();
        });

        afterEach(cb => {

            server.close(cb);
        });

        it('should 200 OK for existing methods', done => {

            request(server)
                .post('/do-something')
                .expect(200, done);
        });

        it('should 404 on non-existing methods', done => {

            request(server)
                .post('/some-non-existent-method')
                .expect(404, done);
        });

        it('should take input arguments', done => {

            request(server)
                .post('/to-upper')
                .send({args: {message: 'very very cool message'}})
                .expect(/VERY VERY COOL MESSAGE/, done);
        });

        it('should print an error when one occurs', done => {

            request(server)
                .post('/fail')
                .expect(/something went awfully wrong/, done);
        });

        it('should explicitly indicate success', done => {

            request(server)
                .post('/do-something')
                .expect(/SHIPMENT: ok/, done);
        });

        it('should explicitly indicate failure', done => {

            request(server)
                .post('/fail')
                .expect(/SHIPMENT: error: something went awfully wrong/, done);
        });

        // TODO add verifyKey tests
    });

    describe('serve (encrypted)', () => {

        let server;

        beforeEach(() => {

            server = shipment.serve({encrypt: true});
        });

        afterEach(cb => {

            server.close(cb);
        });

        it('should provide an encryption key', () => {
            return request(server)
                .get('/')
                .expect(200)
                .then(response => {
                    // response.body.should.contain.keys('encrypted', 'key');
                    response.body.encrypted.should.be.true;
                    response.body.key.should.be.a('string')
                });
        });

        it('should decrypt the encrypted payload and process it', () => {
            return request(server).get('/')
                .then(response => {
                    const key     = ursa.createPublicKey(response.body.key);
                    const payload = {
                        encrypted: key.encrypt(JSON.stringify({
                            args: {message: 'very secret message!'},
                        }), 'utf8', 'base64'),
                    };
                    return request(server)
                        .post('/to-upper')
                        .send(payload)
                        .expect(/VERY SECRET MESSAGE/);
                });
        });
    });
});