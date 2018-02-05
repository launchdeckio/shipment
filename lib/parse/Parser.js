const ReceivedContext  = require('./ParsedContext');
const popPathComponent = require('../common/popPathComponent');

/**
 * High-level event "receiver" with a context "cache" that stores
 * every context when it fires its "begin" event
 */
class Parser {

    constructor(receiver) {
        this.contexts = {};
        this.receiver  = receiver;
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
        const contextId = obj.c;
        const parentId  = popPathComponent(contextId);
        const parent    = parentId ? this.getContext(parentId) : null;

        this.contexts[contextId] = new ReceivedContext({id: contextId, scope: obj.begin.scope, parent});
    }

    /**
     * Invoke event handlers for the given event object
     * @param obj
     */
    fire(obj) {
        const {c: contextId, t: timestamp, ...event} = obj;
        this.receiver(event, {timestamp, context: this.getContext(contextId)});
    }

    /**
     * Get the context associated with the given id
     * If no ReceivedContext available, returns the id
     *
     * @param {String} id
     * @returns {Context|String}
     */
    getContext(id) {
        return (id in this.contexts) ? this.contexts[id] : id;
    }

    static wrap(receive) {
        const parser = new Parser(receive);
        return parser.receive.bind(parser);
    }
}

module.exports = Parser;