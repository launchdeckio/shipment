'use strict';

/**
 * Context derived from a shipment output stream
 * The object instance will be extended with the data in event.begin (e.g. scope, parent) at the EventParser
 * @property {String} id The context UUID
 * @property {Number} timestamp The moment when the context was created, as a UNIX timestamp
 * @property {ParseContext|Null|String} parent The ParseContext parent from the context pool in EventParser.
 * @property {Object} scope The context scope
 */
class ReceivedContext {

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
        if (this.id === id) return true;
        else if (this.parent instanceof ReceivedContext) return this.parent.within(id);
        else return (this.parent === id);
    }
}

module.exports = ReceivedContext;