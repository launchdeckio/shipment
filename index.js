'use strict';

const Shipment = require('./lib/Shipment');

const makeApi  = require('./lib/api/makeApi');
const makeHttp = require('./lib/http/makeHttp');
const events   = require('./lib/events');
const receiver = require('./lib/receive');

module.exports = Shipment;

module.exports.makeApi  = makeApi;
module.exports.makeHttp = makeHttp;
module.exports.events   = events;
module.exports.receiver = receiver;
