'use strict';

const {clone} = require('lodash');
const uuid    = require('uuid');

const {begin} = require('./events');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @param {String} [parentId = null] Parent ID
     * @param {Function} receiver
     * @constructor
     */
    constructor(options = {}, scope = {}, parentId = null, receiver = null) {

        // TODO better, more efficient ID assignment
        // loosely based on some sort of subnet system

        this.id = uuid.v4();

        this.scope    = scope;
        this.options  = options;
        this.parentId = parentId;

        this.emit = evt => receiver({
            context:   this.id,
            timestamp: (new Date()).getTime(),
            ...evt,
        });

        this.emit(begin(this));
    }

    /**
     * Retrieve the object of options that should be inherited by subcontexts
     * @returns {Object}
     */
    getInheritedOptions() {
        return this.options;
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
}

/**
 * Creates a new context based on the given, extending the scope with the given object.
 * @param {Context} [context]
 * @param {Object} [scope = {}]
 * @param {Function} [constructor = null] Optionally pass in a different class (constructor)
 */
Context.createSubContext = (context, scope = {}, constructor = null) => {
    if (constructor === null) constructor = this.constructor;
    const options = clone(context.getInheritedOptions());
    return new constructor(options, scope, context.id);
};

module.exports = Context;