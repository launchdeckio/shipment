'use strict';

const _ = require('lodash');

/**
 * Generate an "emitter" (an object that has methods
 * to emit each of the events made available by the given event factories)
 *
 * When emitting, the provided factories will be invoked with the given context as the first argument,
 * and the argument provided by the caller as the second argument.
 *
 * The return value of the factories should be an object. This object will be
 * extended with the context and the timestamp and passed to the given receiving handler.
 *
 * @param {Object} eventFactories
 * @param {Context} context
 * @param {Function} receive
 *
 * @returns {Object}
 */
module.exports = (eventFactories, context, receive) => {

    return _.mapValues(eventFactories, factory => arg => {

        receive(_.extend({

            context:   context.id,
            timestamp: (new Date()).getTime(),

        }, factory.call(context, context, arg)));
    });
};