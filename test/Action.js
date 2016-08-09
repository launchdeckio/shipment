'use strict';

const _               = require('lodash');
const sinon           = require('sinon');
const sinonAsPromised = require('sinon-as-promised');
const sprintf         = require('sprintf-js').sprintf;
const Promise         = require('bluebird');

require('./support/support');

const Action  = require('./../lib/Action');
const Context = require('./../lib/Context');

describe('Action', () => {

    let action,
        SubAction, subAction, subActionSpy,
        customContextSpy, MockContext, mockContext,
        CustomContextSubAction, customContextSubAction;

    beforeEach(() => {
        action                         = new Action();
        subActionSpy                   = sinon.spy();
        SubAction                      = class SomeSubAction extends Action {
            run(context, options) {
                subActionSpy(...arguments);
            }
        };
        subAction                      = new SubAction();
        customContextSpy               = sinon.spy();
        MockContext                    = class {
            constructor() {
                customContextSpy(...arguments);
            }

            getUptime() {
                return 1337;
            }
        };
        mockContext                    = new MockContext({});
        CustomContextSubAction         = class extends SubAction {
            parseContextArgs() {
                return {foo: 'bar'};
            }
        };
        CustomContextSubAction.Context = MockContext;
        customContextSubAction         = new CustomContextSubAction();
    });

    describe('run', () => {

        it('should throw if not implemented', () => {

            (() => (new Action()).run(null, {})).should.throw();
        });
    });

    describe('getDescription', () => {

        it('should get the description from the static property by default', () => {

            SubAction.description = 'some description';
            (new SubAction()).getDescription().should.equal('some description');
        });
    });

    describe('getName', () => {

        it('should derive the action name from the class name by default', () => {

            subAction.getName().should.equal('some-sub-action');
        });
    });

    describe('makeContext', () => {

        it('should make a new instance of Context by default', () => {

            subAction.makeContext({}).should.be.an.instanceOf(Context);
        });

        it('should allow the use of a custom Context class', () => {

            customContextSubAction.makeContext({}).should.be.an.instanceOf(MockContext);
        });

        it('should call the Context constructor with the return value of parseContextArgs', () => {

            customContextSubAction.makeContext({});
            customContextSpy.should.have.been.calledWith(sinon.match({foo: 'bar'}));
        });

        _.each([true, false], cli => {
            it(sprintf('should assign the cli property %s', cli ? 'true' : 'false'), () => {
                customContextSpy.reset();
                customContextSubAction.makeContext({}, cli);
                customContextSpy.firstCall.args.should.have.deep.property('[0].cli', cli);
            });
        })
    });

    describe('onSuccess', () => {

        it('should invoke onSuccess on the reporter', () => {

            mockContext.reporter = {
                onSuccess: sinon.spy()
            };
            action.onSuccess(mockContext);
            mockContext.reporter.onSuccess.should.have.been.calledWith(action, 1337);
        })
    });

    describe('onError', () => {

        it('should invoke onError on the reporter', () => {

            mockContext.reporter = {
                onError: sinon.spy()
            };
            let error            = new Error('Something went horribly wrong');
            action.onError(mockContext, error);
            mockContext.reporter.onError.should.have.been.calledWith(action, error, 1337);
        })
    });

    describe('getAvailableOptions', () => {

        it('should return an array', () => {

            action.getAvailableOptions().should.be.an('array');
        });
    });

    describe('getContextDefaults', () => {

        it('should return an object', () => {

            action.getContextDefaults().should.be.an('object');
        });
    });

    describe('prepare', () => {

        it('should return a function', () => {

            action.prepare().should.be.a('function');
        });

        it('should return a function that invokes beforeRun, run, afterRun in that order and with the context and options', () => {

            _.forEach(['beforeRun', 'afterRun'], fn => sinon.spy(action, fn));
            sinon.stub(action, 'run', () => Promise.delay(10));
            sinon.stub(action, 'parseArgs', args => {
                return {foofoo: args.foo};
            });
            return action.prepare(mockContext, {foo: 'barbar'})().then(() => {
                _.forEach(['beforeRun', 'run', 'afterRun'], fn => {
                    action[fn].should.have.been.calledOnce;
                    action[fn].should.have.been.calledWith(mockContext, sinon.match({foofoo: 'barbar'}));
                });
                action.run.should.have.been.calledAfter(action.beforeRun);
                action.afterRun.should.have.been.calledAfter(action.run);
            });
        });
    });

    describe('executeCli', () => {

        beforeEach(() => {
            mockContext.reporter = {
                onError:   sinon.spy(),
                onSuccess: sinon.spy()
            };
            sinon.stub(action, 'makeContext').returns(mockContext);
        });

        it('should invoke prepare as well as the function returned by prepare', () => {

            let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare', () => exec);
            // sinon.stub(action, 'makeContext');
            action.executeCli({some: 'arg'}).then(() => {
                action.prepare.should.have.been.calledWith(mockContext, sinon.match({some: 'arg'}));
                exec.should.have.beenCalled;
            });
        });

        it('should invoke onError on the reporter if the exec function rejects', () => {

            sinon.stub(action, 'prepare').returns(() => Promise.reject());
            action.executeCli({}).then(() => {
                mockContext.reporter.onError.should.have.been.called;
                mockContext.reporter.onSuccess.should.not.have.been.called;
            });
        });

        it('should invoke onSuccess on the reporter if the exec function resolves', () => {

            sinon.stub(action, 'prepare').returns(() => Promise.resolve());
            action.executeCli({}).then(() => {
                mockContext.reporter.onSuccess.should.have.been.called;
                mockContext.reporter.onError.should.not.have.been.called;
            });
        });
    });

    describe('executeApi', () => {

        it('should invoke prepare as well as the function returned by prepare', () => {

            let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare').returns(exec);
            // sinon.stub(action, 'makeContext');
            action.executeApi({some: 'arg'}).then(() => {
                action.prepare.should.have.been.calledWith(mockContext, sinon.match({some: 'arg'}));
                exec.should.have.beenCalled;
            });
        });

        it('should directly return the result of exec', () => {

            // let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare').returns(() => 'beepboop');
            return action.executeApi({}).should.equal('beepboop');
        });
    });

    describe('parseArgs', () => {

        it('should return an object', () => {

            return action.parseArgs({}).should.be.an('object');
        });
    });

    describe('parseContextArgs', () => {

        it('should invoke transformContextOptions on the available options', () => {

            sinon.stub(action, 'getContextDefaults').returns({bar: 'baz'});
            sinon.stub(action, 'getAvailableOptions').returns([{
                transformContextOptions: (options, args) => _.extend(options, {foofoo: args.foo})
            }]);
            action.parseContextArgs({foo: 'barbarbar'}).should.deep.equal({
                bar:    'baz',
                foofoo: 'barbarbar'
            });
        });
    });

    describe('describeAction', () => {


        it('should invoke transformYargs on the available options', () => {

            sinon.stub(action, 'getAvailableOptions').returns([{
                transformYargs: (yargs) => yargs.transformed = true
            }]);
            action.describeAction({transformed: false}).should.have.property('transformed', true);
        });
    });

    describe('register', () => {

        it('should register the commands to the given instance of yargs', () => {

            let yargs = require('yargs');
            (subAction).register(yargs, 0);
            subActionSpy.should.not.have.been.called;
            yargs.parse('some-sub-action');
            return Promise.delay(20).then(() => {
                // Because the actions are ran via Promises that cannot be intercepted when calling yargs.parse
                subActionSpy.should.have.been.calledOnce;
            });
        })
    });
});