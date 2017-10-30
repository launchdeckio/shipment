'use strict';

const assert           = require('assert');
const {isString, find} = require('lodash');

const Shipment = require('./Shipment');

class ShipmentWorker {

    constructor(exportPath) {
        assert(isString(exportPath), `Export path should be a string, ${typeof exportPath} given.`);
        this.shipment = require(exportPath);
        assert(this.shipment instanceof Shipment, `The module at ${exportPath} does not provide a Shipment instance.`);
    }

    /**
     * Call the given action on the internal shipment instance
     * @param {String} action
     * @param {Object} args
     * @returns {Promise}
     */
    call({action, args}) {
        let a = find(this.shipment.actions, a => a.getName() === action);
        if (!a) throw new Error(`No action with name ${action} found in Shipment instance`);
        return a.executeApi(args);
    }

    /**
     * Process an incoming message (from the forker process)
     * @param {String} exportPath
     * @param {String} action
     * @param {String} verifyKey Optional key that can be used to verify the origin of shipment log lines
     * @param {Object} args
     * @returns {Promise}
     */
    static async processMessage({exportPath, action, args, verifyKey = ''}) {
        let prefix = `SHIPMENT${verifyKey ? `-${verifyKey}` : ''}: `;
        process.stdout.write(`${prefix}start: ${action}\n`);
        const worker = new ShipmentWorker(exportPath);
        try {
            await worker.call({action, args});
            process.stdout.write(`${prefix}ok\n`);
            process.exit();
        } catch (e) {
            // @TODO report error with more details?
            process.stderr.write(`${prefix}error: ${e.message}\n`);
            process.exit(1);
        }
    }
}

process.on('message', message => ShipmentWorker.processMessage(message));

module.exports = ShipmentWorker;