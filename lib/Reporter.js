'use strict';

const sprintf          = require('sprintf-js').sprintf;
const path             = require('path');
const chalk            = require('chalk');
const notifier         = require('node-notifier');
const defaults         = require('defa');
const GracefulError    = require('./GracefulError');
const readableInterval = require('./util/readableInterval');
const PrettyError      = require('pretty-error');

class Reporter {

    /**
     * Get default options to be passed to notifier.notify
     * May be overridden to provide logo, etc
     * @returns {{}}
     */
    getToastDefaults() {
        return {};
    }

    /**
     * Display native toast with icon
     * @param {Object} options
     */
    doToast(options) {
        return notifier.notify(defaults(options, this.getToastDefaults()));
    }

    /**
     * Reports the completion of an action
     * @param {Action} action
     * @param {Number} [uptime] The time since the action was started
     */
    onSuccess(action, uptime) {
        let message = sprintf('✓ %s completed', action.getName());
        if (uptime) message += sprintf(' (%s)', readableInterval(uptime));
        console.log('\n' + chalk.green(message) + '\n');
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
        console.log('\n' + color(error.message));
        if (!isControlled) {
            var pe = new PrettyError();
            pe.appendStyle({'pretty-error > header': {display: 'none'}});
            console.log(pe.render(error));
        }
        if (uptime > 1000)
            this.doToast({message: 'An error occurred'});
    }

    /**
     * Shows a warning message
     * @param {string} message
     */
    warn(message) {
        console.log(chalk.yellow(message));
    }

    /**
     * Displays some info
     * @param {string} message
     */
    info(message) {
        console.info(chalk.grey(message));
    }
}

module.exports = Reporter;