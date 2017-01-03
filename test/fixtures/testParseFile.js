#!/usr/bin/env node

'use strict';

const reader     = require('./generate/testParserCliReporterStream');
const fileStream = require('./generate/testFileStream');

fileStream.pipe(reader);