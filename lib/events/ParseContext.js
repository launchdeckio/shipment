'use strict';

/**
 * Context derived from a shipment output stream
 */
class ParseContext {

    constructor(timestamp, parent, scope) {
        this.timestamp = timestamp;
        this.parent    = parent;
        this.scope     = scope;
    }
}

module.exports = ParseContext;