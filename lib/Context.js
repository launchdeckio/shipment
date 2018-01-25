'use strict';

const uuid = require('uuid');

const {begin} = require('./events');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Function} receive
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}] A "scope" object specific to this context. The scope will be "broadcast"
     *                              at context creation and won't be inherited by sub-contexts.
     * @param {string} [id = '0']
     * @constructor
     */
    constructor(receive, options = {}, scope = {}, id = '0') {

        // TODO better, more efficient ID assignment
        // loosely based on some sort of subnet system

        this.id = uuid.v4();

        this.receive = receive;
        this.options = options;
        this.scope   = scope;
        this.id      = id;

        this.subContextCount = 0;

        this.emit = evt => receive({
            context:   this.id,
            timestamp: (new Date()).getTime(),
            ...evt,
        });

        this.emit(begin(this));
    }

    getSubId() {
        let subId = this.subContextCount;
        this.subContextCount++;
        return `${this.id}.${subId}`;
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