'use strict';

const Reporter = require('./../lib/Reporter');

require('./support/index');

const sinon = require('sinon');

describe('Reporter', () => {

    let reporter,
        CustomReporter, mockAction, customReporter;

    beforeEach(() => {

        reporter                  = new Reporter();
        mockAction                = {getName: () => 'some cool shit'};
        CustomReporter            = class extends Reporter {
        };
        CustomReporter.makeLogger = () => {
            return {
                custom: true,
                info:   sinon.spy(),
                warn:   sinon.spy()
            }
        };
        customReporter            = new CustomReporter();
    });

    afterEach(() => {

    });

    it('should, by default, generate methods for each of the underlying logger\'s log levels', () => {

        reporter.info.should.be.a.function;
        reporter.warn.should.be.a.function;
        reporter.fatal.should.be.a.function;
        reporter.error.should.be.a.function;
        reporter.debug.should.be.a.function;
        reporter.trace.should.be.a.function;
    });

    it('should use the logger static property to instantiate the logger', () => {

        customReporter.logger.custom.should.be.ok;
    });
});