#!/usr/bin/env node

'use strict';

const reader     = require('./generate/testParserCliReporterStream');
const parseStdin = require('./generate/testStdinParser');

parseStdin(reader);