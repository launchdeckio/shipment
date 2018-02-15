'use strict';

module.exports = ({

    raw = false,

} = {}) => raw ? (event, info) => { // eslint-disable-line no-unused-vars

    return JSON.stringify(event);

} : () => null;