'use strict';

/**
 * Add the "SHIPMENT-12345: start" type logging around the given function
 * @param {String} verifyKey
 * @param {String} actionName
 * @param {Stream} out Output stream
 * @param {Stream} err Error stream
 * @param {Function} fn The function
 * @returns {Boolean} Whether the operation ran successfully
 */
module.exports = async (verifyKey, actionName, out, err, fn) => {

    const prefix = `SHIPMENT${verifyKey ? `-${verifyKey}` : ''}: `;

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
};