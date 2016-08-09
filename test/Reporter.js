'use strict';

const Reporter = require('./../lib/Reporter');

require('./support/support');

const sinon = require('sinon');

describe('Reporter', () => {

    let mockAction, customReporter, notifierSpy, consoleLogSpy, consoleWarnSpy, consoleInfoSpy;

    let CustomReporter = class extends Reporter {
    };

    beforeEach(() => {

        mockAction     = {getName: () => 'some cool shit'};
        notifierSpy    = sinon.spy(CustomReporter.notifier, 'notify');
        consoleLogSpy  = sinon.spy(CustomReporter.console, 'log');
        consoleWarnSpy = sinon.spy(CustomReporter.console, 'warn');
        consoleInfoSpy = sinon.spy(CustomReporter.console, 'info');
        customReporter = new CustomReporter();
    });

    afterEach(() => {

        notifierSpy.restore();
        consoleLogSpy.restore();
        consoleWarnSpy.restore();
        consoleInfoSpy.restore();
    });

    describe('doToast', () => {

        it('should invoke the notifier', () => {
            let options = {message: 'foobarity is exceeding reasonable limits'};
            customReporter.doToast(options);
            notifierSpy.should.have.been.calledWith(options);
        });
    });

    describe('onSuccess', () => {

        it('should print what action was performed', () => {

            customReporter.onSuccess(mockAction);
            consoleLogSpy.should.have.been.calledWithMatch('some cool shit');
        });
    });

    describe('onError', () => {

        it('should print the error message', () => {

            customReporter.onError(mockAction, new Error('something reeeallly bad'));
            consoleLogSpy.should.have.been.calledWithMatch('something reeeallly bad');
        });
    });

    describe('warn', () => {

        it('should invoke the console.warn method', () => {

            customReporter.warn('beepity doo');
            consoleWarnSpy.should.have.been.calledWithMatch('beepity doo');
        });
    });

    describe('info', () => {

        it('should invoke the console.info method', () => {

            customReporter.info('beepity doo');
            consoleInfoSpy.should.have.been.calledWithMatch('beepity doo');
        });
    });
});