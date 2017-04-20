'use strict';

const shipment = require('./testShipment')();

const serve = () => shipment.serve({encrypt: true});

if (require.main === module)
    serve();
else
    module.exports = serve;