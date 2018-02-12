'use strict';

const serializeError = require('serialize-error');

/**
 * Add the "SHIPMENT: x" type logging around the given function
 * @param {String} actionName
 * @param {Stream} out Output stream
 * @param {Stream} err Error stream
 * @param {Function} fn The function
 * @returns {Boolean} Whether the operation ran successfully
 */
module.exports = async (actionName, out, err, fn) => {
    try {
        return await fn();
    } catch (e) {
        err.write(`SHIPMENT: error: ${serializeError(e)}\n`);
        throw e;
    }
};