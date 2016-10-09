'use strict';

const arrify = require('arrify');
const _      = require('lodash');

const EventParser = require('./EventParser');

module.exports = (formatters, options) => {

    let parser = new EventParser();
    _.forEach(arrify(formatters), registerFormatter => registerFormatter(parser, options));

    return obj => parser.receive(obj);
};