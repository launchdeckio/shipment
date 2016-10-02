'use strict';

require('./support/index');

const Promise = require('bluebird');
const sinon   = require('sinon');

const Context  = require('./../lib/Context');
const Reporter = require('./../lib/Reporter');

describe('Context', () => {

    let context,
        CustomReporter, customReporterConstructorSpy, customReporterReportSpy,
        CustomReporterContext, customReporterContext;

    beforeEach(() => {
        context                        = new Context;
        customReporterConstructorSpy   = sinon.spy();
        customReporterReportSpy        = sinon.spy();
        CustomReporter                 = class {
            constructor() {
                customReporterConstructorSpy(...arguments);
                this.begin = sinon.spy();
            }

            clone() {
                return new this.constructor();
            }
        };
        CustomReporterContext          = class extends Context {
            makeReporter() {
                return new CustomReporter(this);
            }
        };
        CustomReporterContext.Reporter = CustomReporter;
        customReporterContext          = new CustomReporterContext;
    });

    describe('makeReporter', () => {

        it('should make an instance of Reporter', () => {

            context.makeReporter().should.be.an.instanceOf(Reporter);
        });

        it('should allow the use of a custom Reporter class', () => {

            customReporterContext.makeReporter().should.be.an.instanceOf(CustomReporter);
        });

        it('should invoke the Reporter constructor with itself as the argument', () => {

            customReporterContext.makeReporter();
            customReporterConstructorSpy.should.have.been.calledWith(customReporterContext);
        });
    });

    describe('createSubContext', () => {

        let options, customContext, subContext, internalScope;

        beforeEach(() => {

            options       = {verbosity: 3};
            internalScope = {base: 'foo'};
            customContext = new CustomReporterContext(options, internalScope);
            subContext    = customContext.createSubContext({ext: 'bar'});
        });

        it('should not have any side-effects on the initial scope', () => {

            internalScope.should.deep.equal({base: 'foo'});
        });

        it('should use the same reporter class', () => {

            subContext.should.be.an.instanceOf(CustomReporterContext);
        });

        it('should create a new context with the given scope', () => {

            subContext.scope.should.deep.equal({ext: 'bar'});
        });

        it('should set the parent property accordingly', () => {

            subContext.parent.should.equal(customContext.id);
        });

        it('should create a new context with a unique ID', () => {

            subContext.id.should.not.equal(customContext.id);
        });
    });

    describe('withScope', () => {

        it('should run some function with a subContext that includes the given scope', () => {

            new Context({}, {base: 'foo'}).withScope({ext: 'bar'}, context => context.scope.ext).should.equal('bar');
        });
    });
});