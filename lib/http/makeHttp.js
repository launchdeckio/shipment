'use strict';

const ShipmentServer = require('./ShipmentServer');

module.exports = (shipment, options) => new ShipmentServer(shipment, options);