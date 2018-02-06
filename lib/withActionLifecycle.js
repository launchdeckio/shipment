const {result, runAction, done, error} = require('./events');

module.exports = async (context, action, fn) => {

    context.emit(runAction(action));

    try {

        const data = await fn();

        context.emit(result(data, action));
        context.emit(done(action));

        return data;

    } catch (e) {

        context.emit(error(e));
        throw e;
    }
};