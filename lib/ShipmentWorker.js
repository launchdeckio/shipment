'use strict';

const _ = require('lodash');

const Shipment = require('./Shipment');

class ShipmentWorker {

    constructor(exportPath) {
        if (!_.isString(exportPath))
            throw new Error(`Exportpath should be a string, ${exportPath} given`);
        this.shipment = require(exportPath);
        if (!(this.shipment instanceof Shipment))
            throw new Error(`The module at ${exportPath} does not provide an instance of Shipment`);
    }

    /**
     * Call the given action on the internal shipment instance
     * @param {String} action
     * @param {Object} args
     * @returns {Promise}
     */
    call({action, args}) {
        let a = _.find(this.shipment.actions, a => a.getName() === action);

        if (!a) throw new Error(`No action with name ${action} found in Shipment instance`);

        return a.executeApi(args);
    }

    /**
     * Process an imcoming message (from the forker process)
     * @param {String} exportPath
     * @param {String} action
     * @param {String} verifyKey Optional key that can be used to verify the origin of shipment log lines
     * @param {Object} args
     * @returns {Promise.<T>}
     */
    static processMessage({exportPath, action, args, verifyKey = ''}) {
        let prefix = `SHIPMENT${verifyKey ? `-${verifyKey}` : ''}: `;
        console.log(`${prefix}start: ${action}`); // eslint-disable-line no-console
        const worker = new ShipmentWorker(exportPath);
        return worker.call({action, args})
            .then(() => {
                console.log(`${prefix}ok`); // eslint-disable-line no-console
                process.exit();
            })
            .catch(e => {
                console.error(`${prefix}error: ${e.message}`); // eslint-disable-line no-console
                process.exit(1);
            });
    }
}

process.on('message', message => ShipmentWorker.processMessage(message));

module.exports = ShipmentWorker;