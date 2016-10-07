'use strict';

const _ = require('lodash');

/**
 * Combine the given handlers into a single handler function. Inspired by redux' "combineReducers"
 * Each handler will be invoked with
 * 1. the value (immutable) at path of the respective handler's key in the event data
 * 2. the info object {context, timestamp}
 *
 * @param {Object} handlers
 * @returns {function}
 */
module.exports = handlers => {

    /**
     * @param {Immutable} data
     * @param {{context: Context, timestamp: Number}} info
     */
    return (data, info) => {

        data = data.map((value, key) => _.has(handlers, key) ? handlers[key](value, info) : value);

        return data.some(val => val !== null && val !== undefined) ? data : null;
    };
};