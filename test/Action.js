'use strict';

const _               = require('lodash');
const path            = require('path');
const sinon           = require('sinon');
const sinonAsPromised = require('sinon-as-promised');
const sprintf         = require('sprintf-js').sprintf;
const Promise         = require('bluebird');

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
        SubAction                      = class SomeSubAction extends Action {
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

            getUptime() {
                return 1337;
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

            customContextSubAction.makeContext({}, true);
            customContextSpy.should.have.been.calledWith(sinon.match({foo: 'bar', cli: true}));
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

        it('should invoke report on the context', () => {

            mockContext = {
                report: sinon.spy()
            };
            action.onSuccess(mockContext);
            mockContext.report.should.have.been.calledWith('info');
        })
    });

    describe('onError', () => {

        it('should invoke report on the context', () => {

            mockContext = {
                report: sinon.spy()
            };
            let error   = new Error('Something went horribly wrong');
            (() => action.onError(mockContext, error)).should.throw();
            (() => action.onError(mockContext, error, false)).should.not.throw();
            mockContext.report.should.have.been.calledWith('fatal', sinon.match({error: sinon.match.string}));
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

    describe('prepare', () => {

        it('should return a function', () => {

            action.prepare().should.be.a('function');
        });

        it('should return a function that invokes action.execute within a scoped context', () => {

            sinon.stub(action, 'execute');
            sinon.spy(mockContext, 'withScope');
            action.prepare(mockContext, {})();
            action.execute.should.have.beenCalled;
            mockContext.withScope.should.have.been.calledWithMatch({action: {name: 'action'}});
        });
    });

    describe('execute', () => {

        it('should invoke beforeRun, run, afterRun in order', () => {
            _.forEach(['beforeRun', 'afterRun'], fn => sinon.spy(action, fn));
            sinon.stub(action, 'run', () => Promise.delay(10));
            sinon.stub(action, 'parseArgs', args => {
                return {foofoo: args.foo};
            });
            mockContext.report = sinon.stub();
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
            mockContext.reporter = {};
            sinon.stub(action, 'makeContext').returns(mockContext);
        });

        it('should invoke prepare as well as the function returned by prepare', () => {

            let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare', () => exec);
            // sinon.stub(action, 'makeContext');
            return action.executeCli({some: 'arg'}).then(() => {
                action.prepare.should.have.been.calledWith(mockContext, sinon.match({some: 'arg'}));
                exec.should.have.beenCalled;
            });
        });

        it('should catch thrown error', () => {

            sinon.stub(action, 'prepare').returns(() => Promise.reject());
            return action.executeCli({}, 0).should.eventually.be.fulfilled;
        });
    });

    describe('executeApi', () => {

        it('should invoke prepare as well as the function returned by prepare', () => {

            let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare').returns(exec);
            return action.executeApi({some: 'arg'}).then(() => {
                action.prepare.should.have.been.calledWith(sinon.match.object, sinon.match({some: 'arg'}));
                exec.should.have.beenCalled;
            });
        });

        it('should directly return the result of exec', () => {

            // let exec = sinon.stub().resolves();
            sinon.stub(action, 'prepare').returns(() => 'beepboop');
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
            yargs.parse('some-sub-action');
            return Promise.delay(20).then(() => {
                // Because the actions are ran via Promises that cannot be intercepted when calling yargs.parse
                subActionSpy.should.have.been.calledOnce;
            });
        })
    });
});