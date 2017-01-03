'use strict';

/**
 * Holds the names of the default events
 */
module.exports = {

    BEGIN:  'begin',
    DONE:   'done', // action success
    RESULT: 'result',
    ERROR:  'error',

    // ERROR and DONE are mutually exclusive

    RUN_ACTION: 'runAction',
};