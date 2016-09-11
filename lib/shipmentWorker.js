'use strict';

const _ = require('lodash');

const Shipment   = require('./Shipment');
const objectHash = require('object-hash');

process.on('message', message => {

    let {exportPath, hash, action, args} = message;
    let shipment                         = require(exportPath);

    if (!shipment instanceof Shipment)
        throw new Error('The exportPath did not provide an instance of Shipment -- aborting');

    // TODO figure out when hash mismatches occur
    // if (objectHash(shipment) !== hash)
    //     throw new Error('Hash mismatch');

    let actions = _.map(shipment.actions, Action => new Action);
    let a       = _.find(actions, a => a.getName() === action);

    if (!a)
        throw new Error(`No action with name ${action} found in Shipment instance`);

    console.log(`SHIPMENT: running (${action})`);
    a.executeApi(args)
        .then(() => console.log('SHIPMENT: ok'))
        .catch(e => console.error(`SHIPMENT: error: ${e.message}`))
        .then(() => process.exit());
});

// process.on('exit', code => {
//
//     console.log(`SHIPMENT: exit (${code})`);
// });