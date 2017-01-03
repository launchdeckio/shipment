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
        if (!id) throw new Error('No ID provided for ParseContext');
        this.id        = id;
        this.timestamp = created;
    }

    /**
     * Determine whether this context is the context with the ID given, or a descendant of that context
     * @param {String} id
     */
    within(id) {
        if (id instanceof ParseContext) id = id.id;
        if (this.id === id) return true;
        else if (this.parent instanceof ParseContext) return this.parent.within(id);
        // TODO if an error occurs somewhere around here, it fails super silently
        else return false;
    }
}

module.exports = ParseContext;