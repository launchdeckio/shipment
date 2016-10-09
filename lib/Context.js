'use strict';

const _        = require('lodash');
const uuid     = require('node-uuid');
const arrify   = require('arrify');
const defaults = require('defa');

const makeEmitter            = require('./events/makeEmitter');
const makeRawReceiver        = require('./events/makeRawReceiver');
const makeFormattingReceiver = require('./events/makeFormattingReceiver');

const eventFactories  = require('./events/eventFactories');
const eventFormatters = require('./events/eventFormatters');

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
        this.scope    = scope;
        this.options  = options;
        this.parentId = parentId;

        this.receive = this.options.cli && !this.options.raw ?
            makeFormattingReceiver(this.constructor.eventFormatters, this.options) :
            makeRawReceiver();

        this.emit = makeEmitter(this.constructor.eventFactories, this, this.receive)();

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
    return new constructor(_.extend({}, context.options), scope, context.id);
};

Context.eventFactories  = eventFactories;
Context.eventFormatters = [eventFormatters];

module.exports = Context;