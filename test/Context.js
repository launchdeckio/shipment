'use strict';

require('./support/support');

const Promise = require('bluebird');
const sinon   = require('sinon');

const Context  = require('./../lib/Context');
const Reporter = require('./../lib/Reporter');

describe('Context', () => {

    let context,
        CustomReporter, customReporterSpy,
        CustomReporterContext, customReporterContext;

    beforeEach(() => {
        context                        = new Context;
        customReporterSpy              = sinon.spy();
        CustomReporter                 = class {
            constructor() {
                customReporterSpy(...arguments);
            }
        };
        CustomReporterContext          = class extends Context {
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
            customReporterSpy.should.have.been.calledWith(customReporterContext);
        });
    });

    describe('getUptime', () => {

        it('should return the number of milliseconds that have passed since the instantiation of the context', () => {

            context = new Context;

            return Promise.delay(20).then(() => {

                context.getUptime().should.be.within(18, 30);
            });
        });
    });
});