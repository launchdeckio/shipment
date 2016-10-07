'use strict';

const makeParserStream = require('./../../../lib/parse/makeParserStream');
const EventParser      = require('./../../../lib/parse/EventParser');

let eventParser  = new EventParser();
let streamReader = makeParserStream(obj => eventParser.receive(obj));

module.exports = {reader: streamReader, emitter: eventParser};