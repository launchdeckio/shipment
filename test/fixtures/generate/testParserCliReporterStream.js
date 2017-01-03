'use strict';

const parse = require('./testParser');

const reportCli = require('./../../../lib/events/eventReducers');

reportCli(parse.emitter, {verbosity: 1});

module.exports = parse.reader;