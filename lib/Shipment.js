const {mapValues} = require('lodash');

const Action = require('./Action');

class Shipment {

    /**
     * @param {Object} [actions = []] Object of functions
     */
    constructor(actions = {}) {

        if(actions instanceof Shipment) return actions;

        this.actions = mapValues(actions, (run, name) => new Action({run, name}));
    }
}

module.exports = Shipment;