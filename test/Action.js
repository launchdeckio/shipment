'use strict';

const _       = require('lodash');
const path    = require('path');
const sinon   = require('sinon');
const sprintf = require('sprintf-js').sprintf;
const delay   = require('delay');

require('./support/index');

const Action  = require('./../lib/Action');
const Context = require('./../lib/Context');

describe('Action', () => {

    let cwd = process.cwd();

    let action,
        SubAction, subAction, subActionSpy, subActionCwdSpy,
        customContextSpy, MockContext, mockContext,
        CustomContextSubAction, customContextSubAction;

    beforeEach(() => {
        action                         = new Action();
        subActionSpy                   = sinon.spy();
        subActionCwdSpy                = sinon.spy();
        SubAction                      = class CoolStuffAction extends Action {
            run(context, options) {
                subActionSpy(...arguments);
                subActionCwdSpy(process.cwd());
            }
        };
        subAction                      = new SubAction();
        customContextSpy               = sinon.spy();
        MockContext                    = class {
            constructor(options = {}) {
                customContextSpy(...arguments);
                this.options = {};
            }

            withScope(scope, fn) {
                return fn(this);
            }
        };
        mockContext                    = new MockContext({});
        CustomContextSubAction         = class SomeCustomContextSubAction extends SubAction {
            parseContextArgs(args, cli) {
                return {foo: 'bar', cli};
            }
        };
        CustomContextSubAction.Context = MockContext;
        customContextSubAction         = new CustomContextSubAction();
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    describe('getDescription', () => {

        it('should get the description from the static property by default', () => {

            SubAction.description = 'some description';
            (new SubAction()).getDescription().should.equal('some description');
        });
    });

    describe('getName', () => {

        it('should derive the action name from the class name by default', () => {

            subaction.name.should.equal('cool-stuff');
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
            customContextSpy.should.have.been.calledWith(sinon.match({foo: 'bar', cli: true}));
        });

        it(sprintf('should assign the cli property false'), () => {
            customContextSpy.reset();
            customContextSubAction.makeContext({});
            customContextSpy.firstCall.args[0].should.have.property('cli', false);
        });

        it(sprintf('should assign the cli property true'), () => {
            customContextSpy.reset();
            customContextSubAction.makeContext({});
            customContextSpy.firstCall.args[0].should.have.property('cli', true);
        });
    });

    describe('onSuccess', () => {

        it('should invoke report on the context', () => {

            mockContext = {
                emit: {done: sinon.spy()}
            };
            action.onSuccess(mockContext);
            mockContext.emit.done.should.have.been.called;
        })
    });

    describe('onError', () => {

        let error, mockContext;

        beforeEach(() => {

            mockContext = {
                emit: {error: sinon.spy()}
            };

            error = new Error('Something went horribly wrong');
        });

        it('should invoke report on the context', () => {
            action.onError(mockContext, error);
            mockContext.emit.error.should.have.been.calledWith(error);
        });

        it('is not responsible for rethrowing the error', () => {

            (() => action.onError(mockContext, error)).should.not.throw();
        })
    });

    describe('getAvailableOptions', () => {

        it('should return an array', () => {

            action.getAvailableOptions(true).should.be.an('array');
        });

        it('should include the cwd option in API mode', () => {

            _.some(action.getAvailableOptions(false), option => option.name == 'cwd').should.be.ok;
        });

        it('should not include the cwd option in CLI mode', () => {

            _.some(action.getAvailableOptions(true), option => option.name == 'cwd').should.not.be.ok;
        })
    });

    describe('getContextDefaults', () => {

        it('should return an object', () => {

            action.getContextDefaults().should.be.an('object');
        });
    });

    describe('execute', () => {

        it('should invoke beforeRun, run, afterRun in order', () => {
            _.forEach(['beforeRun', 'afterRun'], fn => sinon.spy(action, fn));
            sinon.stub(action, 'run').callsFake(() => delay(10));
            sinon.stub(action, 'parseArgs').callsFake(args => {
                return {foofoo: args.foo};
            });
            mockContext.emit = {runAction: sinon.spy(), result: sinon.spy(), done: sinon.spy()};
            return action.execute(mockContext, {foo: 'barbar'}).then(() => {
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
            mockContext.emit = {};
            sinon.stub(action, 'makeContext').returns(mockContext);
        });

        it('should invoke execute', () => {

            sinon.stub(action, 'execute').returns(sinon.stub().resolves());
            return action.executeCli({some: 'arg'}).then(() => {
                action.execute.should.have.been.calledWith(mockContext, sinon.match({some: 'arg'}));
            });
        });

        it('should catch thrown error', () => {

            sinon.stub(action, 'execute').returns(() => Promise.reject());
            return action.executeCli({}, 0).should.eventually.be.fulfilled;
        });
    });

    describe('executeApi', () => {

        it('should invoke execute', () => {

            sinon.stub(action, 'execute').returns(Promise.resolve());
            return action.executeApi({some: 'arg'}).then(() => {
                action.execute.should.have.been.calledWith(sinon.match.object, sinon.match({some: 'arg'}));
            });
        });

        it('should directly return the result of exec', () => {

            // let exec = sinon.stub().resolves();
            sinon.stub(action, 'execute').returns('beepboop');
            return action.executeApi({}).should.equal('beepboop');
        });

        it('should change the working directory before running the command, if one is specified', () => {

            let wd = path.dirname(process.cwd());
            wd.should.not.equal(cwd);
            return subAction.executeApi({some: 'arg', cwd: wd}).then(() => {
                subActionCwdSpy.should.have.been.calledWith(wd);
            });
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
            yargs.parse('cool-stuff');
            return delay(20).then(() => {
                // Because the actions are ran via Promises that cannot be intercepted when calling yargs.parse
                subActionSpy.should.have.been.calledOnce;
            });
        })
    });
});