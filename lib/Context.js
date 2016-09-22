'use strict';

const _        = require('lodash');
const Reporter = require('./Reporter');
const defaults = require('defa');

let contexts = 0;

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @param {Context|null} [parent = null]
     * @constructor
     */
    constructor(options = {}, scope = {}, parent = null) {
        defaults(options, {
            cli:       false,
            cwd:       process.cwd(),
            verbosity: 0
        });
        this.scope    = scope;
        this.options  = options;
        this.reporter = this.makeReporter();
        this.created  = new Date().getTime();
        this.id       = contexts;
        this.parent   = parent;
        this.reporter.begin();
        contexts++;
    }

    /**
     * Instantiate a new reporter
     * @returns {Reporter}
     */
    makeReporter() {
        return new (this.constructor.Reporter)(this);
    }

    /**
     * Creates a new context based on this one, extending the scope with the given object.
     * @param {Object} [scope = {}]
     */
    createSubContext(scope = {}) {
        return new this.constructor(_.extend({}, this.options, {}), scope, this);
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
     * @returns {Object}
     */
    serialize() {
        return {
            context: this.id,
            parent:  this.parent ? this.parent.id : null
        };
    }
}
Context.Reporter = Reporter;

module.exports = Context;
