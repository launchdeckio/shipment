'use strict';

const _ = require('lodash');

module.exports = (eventFactories, context, receive) => {

    return _.mapValues(eventFactories, factory => arg => {

        receive(_.extend({

            context:   context.id,
            timestamp: (new Date()).getTime(),

        }, factory.call(context, context, arg)));
    });
};