'use strict';

const parse = require('./testParser');

const reportCli = require('./../../../lib/parse/cliReporter');

reportCli(parse.emitter);

module.exports = parse.reader;