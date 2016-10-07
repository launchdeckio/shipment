#!/usr/bin/env node

'use strict';

const reader = require('./generate/testParserCliReporterStream');
const stdin  = require('./generate/testStdin');

stdin.pipe(reader);