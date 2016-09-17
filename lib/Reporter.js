'use strict';

const pino = require('pino');
const _    = require('lodash');

class Reporter {

    constructor() {
        this.logger = this.constructor.makeLogger();
        this.registerLevels();
    }

    /**
     * Register the logger levels as properties (functions) on the instance
     */
    registerLevels() {
        if (this.logger.levels)
            _.forEach(this.logger.levels.labels, lvl => this[lvl] = data => this.report(lvl, data));
    }

    /**
     * Clone the reporter
     * @returns {Reporter}
     */
    clone() {
        return new this.constructor();
    }

    /**
     * Invoke method named "level" on the logger with data "data"
     * @param {String} [level = "info"]
     * @param {String|Object} [data = {}]
     */
    report(level = "info", data = {}) {
        return this.logger[level](data);
    }
}
Reporter.makeLogger = () => pino();

module.exports = Reporter;