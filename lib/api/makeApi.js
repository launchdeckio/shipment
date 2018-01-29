module.exports = shipment => {

    const api = {};

    for (const name in shipment.actions) {
        const action = shipment.actions[name];
        api[name]    = action.executeApi.bind(action);
    }

    return api;
};