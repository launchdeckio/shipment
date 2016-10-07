'use strict';

const eventStream = require('event-stream');

var Parser = require('newline-json').Parser;

/**
 * Return a writable stream that will decode newline-delimited JSON and invoke the
 * map method for every incoming object with a callback parameter
 * @param {Function} map
 */
module.exports = map => eventStream.pipe(
    new Parser(),
    eventStream.mapSync(map)
);