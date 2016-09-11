'use strict';

const Reporter = require('./../lib/Reporter');

require('./support/support');

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

    it('should use the logger static property to instantiate the logger', () => {

        customReporter.logger.custom.should.be.ok;
    });
});