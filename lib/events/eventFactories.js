'use strict';

const events = require('./events');

module.exports = {

    [events.BEGIN]: context => ({
        begin: {
            parent: context.parentId,
            scope:  context.scope
        }
    }),

    [events.RUN_ACTION]: (context, action) => ({runAction: action.getName()}),

    [events.DONE]: () => ({done: true}),

    [events.RESULT]: (context, result) => ({result: {data: result}}),

    [events.ERROR]: (context, error) => ({error: error.message}),
};