'use strict';

const _        = require('lodash');
const uuid     = require('node-uuid');
const defaults = require('defa');

const Reporter = require('./Reporter');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @param {String} [parent = null] Parent ID
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
        this.id       = uuid.v1();
        this.parent   = parent;
        this.reporter.begin();
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
        return this.constructor.createSubContext(this, scope, this.constructor);
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
            parent:  this.parent
        };
    }
}

/**
 * Creates a new context based on the given, extending the scope with the given object.
 * @param {Context} [context]
 * @param {Object} [scope = {}]
 * @param {Function} constructor
 */
Context.createSubContext = (context, scope = {}, constructor = null) => {
    if (constructor === null) constructor = this.constructor;
    return new constructor(_.extend({}, context.options), scope, context.id);
};

Context.Reporter = Reporter;

module.exports = Context;
