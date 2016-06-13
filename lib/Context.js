'use strict';

const Reporter = require('./Reporter');
const _        = require('lodash');
const defaults = require('defa');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options]
     * @constructor
     */
    constructor(options) {
        defaults(options, {
            verbosity: 0,
            reporter:  this.makeReporter()
        });
        this.reporter  = options.reporter;
        this.verbosity = options.verbosity;
        this.created   = new Date().getTime();
    }

    /**
     * Instantiate a new reporter
     * @returns {Reporter}
     */
    makeReporter() {
        return new Reporter();
    }

    /**
     * Get the amount of milliseconds that have passed since this context was createdd
     * @returns {number}
     */
    getUptime() {
        return new Date().getTime() - this.created;
    }
}

module.exports = Context;
