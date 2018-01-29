class ApiWrapper {

    constructor(shipment) {
        this.shipment = shipment;
    }

    execute(action, ...args) {
        return this.shipment.actions[action](...args);
    }

    get proxy() {
        return Object.keys(this.shipment.actions).reduce((api, name) => {
            api[name] = (...args) => this.execute(name, ...args);
            return api;
        }, {});
    }
}

module.exports = ApiWrapper;