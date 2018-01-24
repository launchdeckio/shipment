'use strict';

const uuid = require('uuid');

const {begin} = require('./events');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Function} receive
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @param {String} [parentId = null] Parent ID
     * @constructor
     */
    constructor(receive, options = {}, scope = {}, parentId = null) {

        // TODO better, more efficient ID assignment
        // loosely based on some sort of subnet system

        this.id = uuid.v4();

        this.receive  = receive;
        this.options  = options;
        this.scope    = scope;
        this.parentId = parentId;

        this.emit = evt => receive({
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
        const options = this.getInheritedOptions();
        return new Context(this.receive, options, scope, this.id);
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

module.exports = Context;