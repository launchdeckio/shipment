'use strict';

const {info} = require('../../lib/events');

module.exports = {

    toUpper({args: {message = ''}}) {
        return message.toUpperCase();
    },

    customEvent({emit}) {
        emit({fooEvent: 'foobar'});
    },

    dispatchInfo({emit}) {
        emit(info('Here\'s some interesting information for you.'));
    },

    error() {
        throw new Error('something went wrong!');
    },
};