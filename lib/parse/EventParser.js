'use strict';

const _         = require('lodash');
const events    = require('events');
const Immutable = require('immutable');

const combineHandlers = require('./combineHandlers');
const ParseContext    = require('./ParseContext');

/**
 * Maps incoming top-level object events to
 * context instances and fire deeper events
 */
class EventParser extends events.EventEmitter {

    constructor() {
        super();
        this.contexts = {};
        this.handlers = [];
    }

    /**
     * Read incoming top-level object
     * @param obj
     */
    receive(obj) {
        if (obj.begin) this.begin(obj);
        else this.fire(obj);
    }

    /**
     * Invoked for incoming "begin" objects
     * @param obj
     */
    begin(obj) {
        let id            = obj.context;
        let parent        = obj.begin.parent;
        let scope         = obj.begin.scope;
        let timestamp     = obj.timestamp;
        var context       = new ParseContext(timestamp, parent, scope);
        this.contexts[id] = context;
        this.emit('begin', context);
    }

    /**
     * Fire appropriate events for objects
     * @param obj
     */
    fire(obj) {

        let context   = this.getContext(obj.context);
        let timestamp = obj.timestamp;
        let data      = Immutable.fromJS(_.omit(obj, 'context', 'timestamp'));

        let info = {context, timestamp};

        _(this.handlers)
            .concat((data, info) => this.emit('uncaught', data, info))
            .forEach(handler => {
                data = handler(data, info);
                if (data === null || data === undefined) return false;
            });
    }

    /**
     * Push the given function onto the event handler stack.
     * The function must return either true (consumed) or false (not consumed) in order to propagate the event
     * to the next handler if appropriate.
     *
     * Event handlers will be invoked with two arguments:
     * 1. An immutable data structure containing the event object with "context" and "timestamp" omitted
     * 2. An object containing {timestamp, context} where context is an instance of ParserContext
     *
     * Note: Objects can be passed in too, they will be converted using `combineHandlers`
     *
     * @param {Function|Object} fn
     */
    use(fn) {
        if (_.isObject(fn)) fn = combineHandlers(fn);
        this.handlers.push(fn);
    }

    /**
     * Get the context associated with the given id
     * @param {String} id
     * @returns {Context}
     */
    getContext(id) {
        return this.contexts[id];
    }
}

module.exports = EventParser;