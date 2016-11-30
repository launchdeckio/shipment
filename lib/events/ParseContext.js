'use strict';

/**
 * Context derived from a shipment output stream
 * The object instance will be extended with the data in event.begin (e.g. scope, parent) at the EventParser
 *
 * @property {String} id The context UUID
 *
 * @property {Number} timestamp The moment when the context was created, as a UNIX timestamp
 *
 * @property {ParseContext|Null|String} parent The ParseContext parent from the context pool in EventParser.
 *                                             In the exceptional case that the context couldn't be found it'll
 *                                             be the UUID
 *
 * @property {Object} scope The context scope
 *
 */
class ParseContext {

    constructor(id, created) {
        this.id        = id;
        this.timestamp = created;
    }
}

module.exports = ParseContext;