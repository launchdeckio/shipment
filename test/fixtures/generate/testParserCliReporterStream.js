'use strict';

const parse = require('./testParser');

const reportCli = require('./../../../lib/parse/reportCli');

reportCli(parse.emitter, {verbosity: 1});

module.exports = parse.reader;