'use strict';

const arrify = require('arrify');
const _      = require('lodash');

const EventParser = require('./EventParser');

/**
 * Given a number of higher order reducers (functions that will take the parser as an argument and register
 * their handlers), generate a receiver (function that can be invoked with an event object)
 *
 * @param {Function[]|Function} higherOrderReducers
 * @param {Object} options
 *
 * @returns {{receiver: Function, parser: EventParser}}
 */
module.exports = (higherOrderReducers, options = {}) => {

    const parser = new EventParser();

    // Register all reducers by invoking the higher order reducers with the parser and the options arguments
    // (or registering them via useCombine if they are objects rather than functions)
    _.forEach(arrify(higherOrderReducers), higherOrderReducer => {

        if (_.isFunction(higherOrderReducer)) higherOrderReducer(parser, options);

        else if (_.isObject(higherOrderReducer)) parser.useCombine(higherOrderReducer);

        else throw new Error('Higher order reducers must be either functions or objects');
    });

    const receiver = parser.receive.bind(parser);

    return {receiver, parser};
};