'use strict';

const {isString, isNumber} = require('lodash');

module.exports = result => {

    if (isString(result) || isNumber(result)) return String(result);

    else return JSON.stringify(result, null, 2);
};
