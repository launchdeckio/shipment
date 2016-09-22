'use strict';

const pino = require('pino');
const _    = require('lodash');

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
        return this.logger(level, data);
    }
}
Reporter.makeLogger = () => (level, data) => console.log(JSON.stringify({level, data}));

module.exports = Reporter;