'use strict';

const testCli = require('./testCli');

module.exports = spy => {

    const shipment      = testCli(spy);
    shipment.exportPath = __dirname + '/testShipmentExporter.js';

    return shipment;
};