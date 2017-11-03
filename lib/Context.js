'use strict';

const {assign, defaults, extend, concat} = require('lodash');

const uuid   = require('uuid');
const arrify = require('arrify');

const events       = require('./events/events');
const makeEmitter  = require('./events/makeEmitter');
const makeReceiver = require('./events/makeReceiver');

const eventFactories = require('./events/eventFactories');
const eventReducers  = require('./events/eventReducers');

class Context {

    /**
     * Represents a context in which an action is executed
     * @param {Object} [options = {}]
     * @param {Object} [scope = {}]
     * @param {String} [parentId = null] Parent ID
     * @constructor
     */
    constructor(options = {}, scope = {}, parentId = null) {

        this.created = new Date().getTime();
        this.id      = uuid.v1();

        defaults(options, {
            cli:       false,
            raw:       false,
            cwd:       process.cwd(),
            verbosity: 0,
        });

        options.format = options.cli && !options.raw;

        this.scope    = scope;
        this.options  = options;
        this.parentId = parentId;

        const r = makeReceiver(this.constructor.eventReducers, this.options);

        this.receive = r.receiver;
        this.parser  = r.parser;

        this.emit = makeEmitter(this.constructor.eventFactories, this, this.receive);

        this.emit.begin();
    }

    /**
     * Creates a new context based on this one, extending the scope with the given object.
     * @param {Object} [scope = {}]
     */
    createSubContext(scope = {}) {
        return this.constructor.createSubContext(this, scope, this.constructor);
    }

    /**
     * Invokes the given function with a new context based on this one, extending the scope with the given object.
     * @param {Object} scope
     * @param {Function} fn
     */
    withScope(scope, fn) {
        return fn(this.createSubContext(scope));
    }
}

/**
 * Creates a new context based on the given, extending the scope with the given object.
 * @param {Context} [context]
 * @param {Object} [scope = {}]
 * @param {Function} constructor
 */
Context.createSubContext = (context, scope = {}, constructor = null) => {
    if (constructor === null) constructor = this.constructor;
    return new constructor(extend({}, context.options), scope, context.id);
};

// Assign the default "eventFactories" to the base Context class
Context.eventFactories = eventFactories;

// Assign the default "eventReducers" to the base Context class
Context.eventReducers = [eventReducers];

module.exports = Context;

/**
 * Given the BaseContext class, return a subclass that, additionally to the "default"
 * factories and reducers, implements the given factories and reducers
 *
 * @param {class} BaseContext
 * @param {Object|Object[]} factories
 * @param {Function|Function[]} [reducers]
 *
 * @returns {SubContext}
 */
module.exports.extend = (BaseContext, factories = {}, reducers = []) => {

    const SubContext = class SubContext extends BaseContext {
    };

    SubContext.eventFactories = assign({}, BaseContext.eventFactories, ...arrify(factories));
    SubContext.eventReducers  = concat(BaseContext.eventReducers, reducers ? reducers : []);

    return SubContext;
};

/**
 * The default shipment events
 *
 * @type {Object}
 */
module.exports.events = events;

module.exports.makeEmitter  = makeEmitter;
module.exports.makeReceiver = makeReceiver;