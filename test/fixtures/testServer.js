'use strict';

const shipment = require('./testShipment')();

const serve = () => shipment.serve();

if (require.main === module)
    serve();
else
    module.exports = serve;