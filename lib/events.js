'use strict';

module.exports = {

    begin(context) {
        return {begin: {scope: context.scope}};
    },

    runAction(action, meta = undefined) {
        return {runAction: action.name, ...(meta ? {meta} : {})};
    },

    done(action) {
        return {done: {action: action.name}};
    },

    result(data, action) {
        return {result: {data, action: action.name}};
    },

    error(message) {
        return {error: message};
    },

    info(message) {
        return {info: message};
    },
};
