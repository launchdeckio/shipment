const {result, runAction, done, error} = require('./events');

module.exports = async (context, action, fn, runActionMeta = undefined) => {

    context.emit(runAction(action, runActionMeta));

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
