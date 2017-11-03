'use strict';

const ShipmentWorker      = require('./lib/ShipmentWorker');
const withServerLifecycle = require('./lib/routines/withServerLifecycle');

process.on('message', async ({exportPath, action, args, verifyKey = ''}) => {
    try {
        await withServerLifecycle(verifyKey, action, process.stdout, process.stderr, async () => {
            const worker = new ShipmentWorker(exportPath);
            await worker.call({action, args});
        });
    } catch (e) {
        process.exit(1);
    }
    process.exit();
});

console.log('shipment worker running...');