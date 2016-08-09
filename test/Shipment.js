'use strict';

const Shipment = require('./../lib/Shipment');
const Action   = require('./../lib/Action');

require('./support/support');

const testCli = require('./support/testcli');

const sinon    = require('sinon');
const Bluebird = require('bluebird');
const execa    = require('execa');
const path     = require('path');

describe('Shipment', () => {

    /**
     * Return a fluent assertion builder for the complete execa result of a call to testcli with the given args
     * @param {String[]} args
     * @returns {Function}
     */
    const resultOf = (args) => {
        return execa('node', [path.join(__dirname, 'support/testcli.js')].concat(args));
    };

    /**
     * Return a fluent assertion builder for the stdout buffer of a call to testcli with the given args
     * @param {String[]} args
     * @returns {Function}
     */
    const stdoutOf = (args) => {
        let builder    = resultOf(args).should.eventually.have.property('stdout');
        builder.should = builder;
        return builder;
    };

    let actionSpy, shipment;

    beforeEach(() => {

        actionSpy = sinon.spy();

        shipment = testCli(actionSpy);
    });

    describe('cli', () => {

        it('should execute the requested action', () => {

            actionSpy.should.not.have.been.called;

            shipment.cli(['some-sub-action']);

            // Because there is no way to intercept the control flow when issuing subcommands via yargs
            // Could also use an eventemitter architecture
            return Bluebird.delay(20).then(() => {

                actionSpy.should.have.been.calledOnce;
                let action = actionSpy.firstCall.args[0];
                action.should.be.an.instanceOf(Action);
                action.getName().should.equal('some-sub-action');
            });
        });

        describe('subcommand', () => {

            it('should run the action', () => {

                return stdoutOf(['some-sub-action']).should.have.string('run some action');
            });
        });

        describe('subcommand that throws', () => {

            it('should have a non-zero exitcode', () => {

                return resultOf(['bad-action']).catch(error => {
                    error.should.have.property('code').that.is.not.equal(0);
                    return 'ok';
                }).should.eventually.equal('ok');
            });
        });

        describe('--help', () => {

            it('should print the subcommands', () => {

                return stdoutOf(['--help']).should
                    .have.string('some-sub-action').and
                    .have.string('another-cool-action').and
                    .have.string('bad-action');
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
            api.someSubAction.should.be.a('function');
            api.anotherCoolAction.should.be.a('function');
        });

        it('should invoke the correct action runners upon calling the corresponding function on the api object', () => {

            actionSpy.should.not.have.been.called;
            return shipment.api().anotherCoolAction().then(() => {
                actionSpy.should.have.been.calledOnce;
                let action = actionSpy.firstCall.args[0];
                action.getName().should.equal('another-cool-action');
            });
        });

        it('should return a promise for the return value of the action', () => {

            shipment.api().returnValueAction().should.eventually.equal('some return value');
        });

        it('should reject if the action throws', () => {

            shipment.api().badAction().should.be.rejected;
        });
    })
});