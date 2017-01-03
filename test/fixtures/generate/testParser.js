'use strict';

const makeParserStream = require('./../../../lib/events/makeParserStream');
const EventParser      = require('./../../../lib/events/EventParser');

let eventParser  = new EventParser();
let streamReader = makeParserStream(obj => eventParser.receive(obj));

module.exports = {reader: streamReader, emitter: eventParser};