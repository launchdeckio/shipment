'use strict';

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

        this.receive = receive;
        this.options = options;
        this.scope   = scope;
        this.id      = id;

        this.branchCount = 0;

        this.emit(begin(this));
    }

    newBranchId() {
        let subId = this.branchCount;
        this.branchCount++;
        return `${this.id}.${subId}`;
    }

    emit(evt) {
        this.receive({
            c: this.id,
            t: (new Date()).getTime(),
            ...evt,
        });
    }

    /**
     * Retrieve the object of options that should be inherited by subcontexts
     * @returns {Object}
     */
    getInheritedOptions() {

        // Returns a shallow clone with all the options by default
        return {...this.options};
    }

    /**
     * "Branch off", creating a new context based on this one, extending the scope with the given object.
     * @param {Object} [scope = {}]
     * @param {Function} [wrapReceive] Optionally provide a function that takes the parent "receiver"
     *      and returns a new one for the sub context
     */
    branch(scope = {}, wrapReceive = null) {
        const options = this.getInheritedOptions();
        const receive = wrapReceive ? wrapReceive(this.receive) : this.receive;
        return new Context(receive, options, scope, this.newBranchId());
    }

    /**
     * Invokes the given function with a new context based on this one, extending the scope with the given object.
     * @param {Object} scope
     * @param {Function} fn
     */
    withScope(scope, fn) {
        return fn(this.branch(scope));
    }
}

module.exports = Context;