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
module.exports = (higherOrderReducers, options) => {

    const parser = new EventParser();

    // Register all reducers by invoking the higher order reducers with the parser and the options arguments
    _.forEach(arrify(higherOrderReducers), higherOrderReducer => higherOrderReducer(parser, options));

    const receiver = obj => parser.receive(obj);

    return {receiver, parser};
};