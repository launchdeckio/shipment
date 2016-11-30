'use strict';

/**
 * Context derived from a shipment output stream
 * The object instance will be extended with the data in event.begin (e.g. scope, parent) at the EventParser
 */
class ParseContext {

    constructor(id, created) {
        this.id        = id;
        this.timestamp = created;
    }
}

module.exports = ParseContext;