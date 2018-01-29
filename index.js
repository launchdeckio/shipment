const Shipment   = require('./lib/Shipment');
const Context    = require('./lib/Context');
const Parser     = require('./lib/parse/Parser');
const ApiWrapper = require('./lib/ApiWrapper');
const HttpServer = require('./lib/http/HttpServer');

const events = require('./lib/events');

const n = actions => new Shipment(actions);

module.exports = {

    Shipment,
    Context,
    Parser,
    ApiWrapper,
    HttpServer,

    events,

    api: actions => new ApiWrapper(n(actions)).proxy,

    http: (actions, options) => new HttpServer(n(actions), options),
};