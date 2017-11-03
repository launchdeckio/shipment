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
        const a = find(this.shipment.actions, a => a.getName() === action);
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
        try {
            await ShipmentWorker.withLifecycle(verifyKey, action, process.stdout, process.stderr, async () => {
                const worker = new ShipmentWorker(exportPath);
                await worker.call({action, args});
            });
        } catch (e) {
            process.exit(1);
        }
        process.exit();
    }

    /**
     * Add the "SHIPMENT-12345: start" type logging around the given function
     * @param {String} verifyKey
     * @param {String} actionName
     * @param {Stream} out Output stream
     * @param {Stream} err Error stream
     * @param {Function} fn The function
     * @returns {Boolean} Whether the operation ran successfully
     */
    static async withLifecycle(verifyKey, actionName, out, err, fn) {
        let prefix = `SHIPMENT${verifyKey ? `-${verifyKey}` : ''}: `;
        out.write(`${prefix}start: ${actionName}\n`);
        try {
            const result = await fn();
            out.write(`${prefix}ok\n`);
            return result;
        } catch (e) {
            // @TODO report error with more details?
            err.write(`${prefix}error: ${e.message}\n`);
            throw e;
        }
    }
}

process.on('message', message => ShipmentWorker.processMessage(message));

module.exports = ShipmentWorker;