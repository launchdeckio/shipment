'use strict';

const {assign}     = require('lodash');
const ParseContext = require('./ParseContext');

/**
 * Event "receiver" with a context "cache" that stores
 * every context when it fires its "begin" event
 */
class Receiver {

    constructor(receive) {
        this.contexts = {};
        this.receive  = receive;
    }

    /**
     * Read incoming top-level object
     * @param obj
     */
    receive(obj) {
        if (obj.begin) this.begin(obj);
        this.fire(obj);
    }

    /**
     * Invoked for incoming "begin" objects
     * Registers the "parse context"
     * @param obj
     */
    begin(obj) {

        let id        = obj.context;
        let timestamp = obj.timestamp;
        let context   = new ParseContext(id, timestamp);

        assign(context, obj.begin);

        // e.g. "begin":{"parent":"507d8410-b172-11e6-a36f-7f298ebb314a","scope":{"action":"land"}}
        // Translate context to actual object
        if (context.parent) context.parent = this.getContext(context.parent);

        this.contexts[id] = context;
    }

    /**
     * Invoke event handlers for the given event object
     * @param obj
     */
    fire(obj) {
        const {context: contextId, timestamp, ...event} = obj;

        let context = this.getContext(contextId);

        this.receive(event, {timestamp, context});
    }

    /**
     * Get the context associated with the given id
     * If no ParseContext available, returns the id
     *
     * @param {String} id
     * @returns {Context|String}
     */
    getContext(id) {
        return (id in this.contexts) ? this.contexts[id] : id;
    }
}

module.exports = Receiver;