'use strict';

const Reporter = require('./../lib/Reporter');

require('./support');

describe('Reporter', () => {

    let reporter, CustomReporter, mockAction, customReporter;

    beforeEach(() => {

        reporter       = new Reporter();
        mockAction     = {getName: () => 'some cool shit'};
        CustomReporter = class extends Reporter {
        };
        customReporter = new CustomReporter();
    });

    // TODO static cliReporters test

    afterEach(() => {

    });
});