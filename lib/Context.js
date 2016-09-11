'use strict';

const _        = require('lodash');
const Reporter = require('./Reporter');
const defaults = require('defa');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @constructor
     */
    constructor(options = {}, scope = {}) {
        defaults(options, {
            cli:       false,
            cwd:       process.cwd(),
            verbosity: 0,
            reporter:  () => this.makeReporter()
        });
        this.scope    = scope;
        this.options  = options;
        this.reporter = options.reporter;
        this.created  = new Date().getTime();
    }

    /**
     * Instantiate a new reporter
     * @returns {Reporter}
     */
    makeReporter() {
        return new (this.constructor.Reporter)(this);
    }

    /**
     * Get the amount of milliseconds that have passed since this context was createdd
     * @returns {number}
     */
    getUptime() {
        return new Date().getTime() - this.created;
    }

    /**
     * Creates a new context based on this one, extending the scope with the given object.
     * @param {Object} [scope = {}]
     */
    createSubContext(scope = {}) {
        return new this.constructor(_.extend({}, this.options, {
            reporter: this.reporter.clone()
        }), _.extend({}, this.scope, scope));
    }

    /**
     * Invokes the given function with a new context based on this one, extending the scope with the given object.
     * @param {Object} scope
     * @param {Function} fn
     */
    withScope(scope, fn) {
        return fn(this.createSubContext(scope));
    }

    /**
     * Invoke method named "level" on the logger with data "data" extending the internal scope
     * @param {String} [level = "info"]
     * @param {String|Object} [data = {}]
     * @returns {*}
     */
    report(level = "info", data = {}) {
        return this.reporter.report(level, _.extend(this.scope, data));
    }
}
Context.Reporter = Reporter;

module.exports = Context;
