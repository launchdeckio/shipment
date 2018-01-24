'use strict';

const {mapValues, camelCase} = require('lodash');

const Action = require('./Action');

class Shipment {

    /**
     * @param {Object} [actions = []] Object of functions
     * @param {String} [exportPath} The path of the module that will export this instance of Shipment.
     *                 Required for the HTTP server to work
     * @returns {Array}
     */
    constructor(actions = {}, {exportPath = null}) {
        this.actions    = mapValues(actions, (run, name) => new Action({run, name}));
        this.exportPath = exportPath;
    }

    /**
     * Generate an object that exposes all actions as functions
     * @returns {{}}
     */
    api() {
        let obj = {};
        for (const name in this.actions) {
            const action = this.actions[name];

            obj[camelCase(name)] = action.executeApi.bind(action);
        }
        return obj;
    }
}

module.exports = Shipment;

module.exports.Action  = require('./Action');
module.exports.Context = require('./Context');
module.exports.Option  = require('./Option');