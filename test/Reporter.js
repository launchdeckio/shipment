'use strict';

const Reporter = require('./../lib/Reporter');

require('./support/support');

const sinon = require('sinon');

describe('Reporter', () => {

    let mockAction, customReporter, doToastSpy, notifierSpy, consoleLogSpy, consoleWarnSpy, consoleInfoSpy;

    let CustomReporter = class extends Reporter {
    };

    beforeEach(() => {

        mockAction     = {getName: () => 'some cool shit'};
        notifierSpy    = sinon.spy(CustomReporter.notifier, 'notify');
        consoleLogSpy  = sinon.spy(CustomReporter.console, 'log');
        consoleWarnSpy = sinon.spy(CustomReporter.console, 'warn');
        consoleInfoSpy = sinon.spy(CustomReporter.console, 'info');
        customReporter = new CustomReporter();
        doToastSpy     = sinon.spy(customReporter, 'doToast');
    });

    afterEach(() => {

        notifierSpy.restore();
        consoleLogSpy.restore();
        consoleWarnSpy.restore();
        consoleInfoSpy.restore();
    });

    describe('doToast', () => {

        it('should invoke the notifier', () => {
            let options = {message: 'foobarity is exceeding all reasonable limits'};
            customReporter.doToast(options);
            notifierSpy.should.have.been.calledWith(options);
        });
    });

    describe('onSuccess', () => {

        it('should print what action was performed and invoke doToast', () => {

            customReporter.onSuccess(mockAction, 1500);
            consoleLogSpy.should.have.been.calledWithMatch('some cool shit');
            doToastSpy.should.have.been.called;
        });

        it('should not invoke doToast with an upTime less than 1s', () => {

            customReporter.onSuccess(mockAction, 500);
            doToastSpy.should.not.have.been.called;
        });
    });

    describe('onError', () => {

        it('should print the error message and invoke doToast', () => {

            customReporter.onError(mockAction, new Error('something reeeallly bad'), 1500);
            consoleLogSpy.should.have.been.calledWithMatch('something reeeallly bad');
            doToastSpy.should.have.been.called;
        });

        it('should not invoke doToast with an upTime less than 1s', () => {

            customReporter.onError(mockAction, new Error('something reeeallly bad'), 500);
            doToastSpy.should.not.have.been.called;
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