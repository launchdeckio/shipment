const {noop} = require('lodash');

const {begin} = require('./events');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {string} [id = '0']
     * @param {Object} [args = {}]
     * @param {Object} [scope = {}] A "scope" object specific to this context. The scope will be "broadcast"
     *  at context creation and won't be inherited by sub-contexts.
     * @param {Function|null} [receive]
     * @constructor
     */
    constructor({

        id = '0',
        args = {},
        scope = {},
        receive = null,

    }) {

        this.id      = id;
        this.args    = args;
        this.receive = receive || noop;
        this.scope   = scope;

        this.branchCount = 0;

        // Create a bound version of "this.emit"
        // so we can use a destructuring expression
        // such as {emit} in the signature of an action
        this.emit = this._emit.bind(this);

        this._emit(begin(this));
    }

    branchId() {
        let subId = this.branchCount;
        this.branchCount++;
        return `${this.id}.${subId}`;
    }

    _emit(evt) {
        this.receive({
            c: this.id,
            t: (new Date()).getTime(),
            ...evt,
        });
    }

    /**
     * Retrieve the object of args that should be inherited by subcontexts
     * @returns {Object}
     */
    getInheritedArgs() {

        // Returns a shallow clone with all the args by default
        return {...this.args};
    }

    /**
     * "Branch off", creating a new context based on this one, extending the scope with the given object.
     * @param {Object} [scope = {}]
     * @param {Function} [wrapReceive] Optionally provide a function that takes the parent "receiver"
     *      and returns a new one for the sub context
     */
    branch(scope = {}, wrapReceive = null) {

        const args    = this.getInheritedArgs();
        const receive = wrapReceive ? wrapReceive(this.receive) : this.receive;

        return new Context({
            id: this.branchId(),
            args,
            scope,
            receive,
        });
    }

    /**
     * Invokes the given function with this. Allows for more readable
     * "scoped" sub-routines.
     * @param {Function} fn
     */
    scoped(fn) {
        return fn(this);
    }
}

module.exports = Context;