'use strict';

const sprintf          = require('sprintf-js').sprintf;
const chalk            = require('chalk');
const notifier         = require('node-notifier');
const GracefulError    = require('./GracefulError');
const readableInterval = require('./util/readableInterval');
const PrettyError      = require('pretty-error');

class Reporter {

    /**
     * Display native toast with icon
     * @param {Object} options
     */
    doToast(options) {
        return notifier.notify(options);
    }

    /**
     * Reports the completion of an action
     * @param {Action} action
     * @param {Number} [uptime] The time since the action was started
     */
    onSuccess(action, uptime) {
        let message = sprintf('✓ %s completed', action.getName());
        if (uptime) message += sprintf(' (%s)', readableInterval(uptime));
        this.constructor.console.log('\n' + chalk.green(message) + '\n');
        if (uptime > 1000)
            this.doToast({message});
    }

    /**
     * Reports an error
     * @param {Action} action
     * @param {Error} error
     * @param {Number} [uptime] The time since the action was started
     */
    onError(action, error, uptime) {
        var isControlled = error instanceof GracefulError;
        var color        = isControlled ? chalk.red : chalk.white.bgRed;
        this.constructor.console.log('\n' + color(error.message));
        if (!isControlled)
            this.constructor.console.log((new PrettyError())
                .appendStyle({'pretty-error > header': {display: 'none'}})
                .render(error));
        if (uptime > 1000)
            this.doToast({message: 'An error occurred'});
    }

    /**
     * Shows a warning message
     * @param {string} message
     */
    warn(message) {
        this.constructor.console.log(chalk.yellow(message));
    }

    /**
     * Displays some info
     * @param {string} message
     */
    info(message) {
        this.constructor.console.info(chalk.grey(message));
    }
}
Reporter.console = console;

module.exports = Reporter;