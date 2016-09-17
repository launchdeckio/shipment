'use strict';

const _ = require('lodash');

const Shipment   = require('./Shipment');
const objectHash = require('object-hash');

class ShipmentWorker {

    constructor(exportPath) {
        if (!_.isString(exportPath))
            throw new Error('Expected a string');
        this.shipment = require(exportPath);
        if (!(this.shipment instanceof Shipment))
            throw new Error(`The module at ${exportPath} did not provide an instance of Shipment -- aborting`);
    }

    call({action, args}) {
        let actions = _.map(this.shipment.actions, Action => new Action);
        let a       = _.find(actions, a => a.getName() === action);

        if (!a)
            throw new Error(`No action with name ${action} found in Shipment instance`);

        return a.executeApi(args);
    }

    static processMessage({exportPath, hash, action, args}) {
        console.log(`SHIPMENT: running (${action})`);
        const worker = new ShipmentWorker(exportPath);
        return worker.call({action, args})
            .then(() => {
                console.log('SHIPMENT: ok');
                process.exit();
            })
            .catch(e => {
                console.error(`SHIPMENT: error: ${e.message}`);
                process.exit(1);
            });
    }
}

process.on('message', message => ShipmentWorker.processMessage(message));

module.exports = ShipmentWorker;