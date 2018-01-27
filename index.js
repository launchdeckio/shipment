'use strict';

const Shipment = require('./lib/Shipment');

const makeApi = require('./lib/api/makeApi');

const receiver = require('./lib/receive');

module.exports = Shipment;

module.exports.makeApi = makeApi;

module.exports.receiver = receiver;


