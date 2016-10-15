'use strict';

/**
 * Context derived from a shipment output stream
 */
class ParseContext {

    constructor(id, created) {
        this.id        = id;
        this.timestamp = created;
    }
}

module.exports = ParseContext;