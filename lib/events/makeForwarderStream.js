'use strict';

const makeParserStream = require('./makeParserStream');

/**
 * Return a writable stream that calls the `receive` method on the given
 * context for each incoming newline-delimited JSON object
 * @param {Context} context
 */
module.exports = context => makeParserStream(obj => context.receive(obj));