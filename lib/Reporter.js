'use strict';

const pino = require('pino');

class Reporter {

    constructor() {
        this.logger = this.constructor.makeLogger();
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