'use strict';

module.exports = {

    begin(context) {
        return {begin: {parent: context.parentId, scope: context.scope}};
    },

    runAction(action) {
        return {runAction: action.name};
    },

    done() {
        return {done: true};
    },

    result(data) {
        return {result: {data}};
    },

    error(message) {
        return {error: message};
    },
};