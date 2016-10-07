'use strict';

const _      = require('lodash');
const events = require('events');

const ParseContext = require('./ParseContext');

/**
 * Maps incoming top-level object events to
 * context instances and fire deeper events
 */
class EventParser extends events.EventEmitter {

    constructor() {
        super();
        this.contexts = {};
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
     * Fire appropriate events for other objects
     * @param obj
     */
    fire(obj) {
        _(obj)
            .keys()
            .without('context', 'timestamp')
            .forEach(key => {
                let context   = this.getContext(obj.context);
                let timestamp = obj.timestamp;
                let data      = obj[key];
                this.emit(key, {context, data, timestamp});
            });
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