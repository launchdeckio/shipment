'use strict';

const fs = require('fs');

module.exports = fs.createReadStream(__dirname + '/../data/parseStdin.txt');