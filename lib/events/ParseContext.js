'use strict';

/**
 * Context derived from a shipment output stream
 */
class ParseContext {

    constructor(id, timestamp, parent, scope) {
        this.id        = id;
        this.timestamp = timestamp;
        this.parent    = parent;
        this.scope     = scope;
    }
}

module.exports = ParseContext;