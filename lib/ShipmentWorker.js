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
}

module.exports = ShipmentWorker;