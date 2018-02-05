module.exports = {

    begin(context) {
        return {begin: {scope: context.scope}};
    },

    runAction(action) {
        return {runAction: action.name};
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
};