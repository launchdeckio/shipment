'use strict';

const testCli = require('./testCli');

const shipment      = testCli();
shipment.exportPath = __filename;

module.exports = shipment;