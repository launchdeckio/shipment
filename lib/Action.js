const {result, runAction, done, error} = require('./events');

const Context = require('./Context');

const withActionLifecycle = async (context, action, fn) => {

    context.emit(runAction(action));

    try {

        const data = await fn();

        context.emit(result(data));
        context.emit(done());

        return data;

    } catch (e) {

        context.emit(error(e.message));
        throw e;
    }
};

class Action {

    constructor({name, run, description = null}) {
        this.name        = name;
        this.run         = run;
        this.description = description;
    }

    /**
     * Make an action wrapper runtime Context instance based on the given arguments
     * @param {Function} receive
     * @param {Object} args
     * @param {Context|null} [parent = null] Parent context instance
     * @returns {Context}
     */
    makeContext(args = {}, receive = null, parent = null) {

        const scope         = {action: this.name};
        const id            = parent && parent.branchId ? parent.branchId() : '0';
        const inheritedArgs = parent && parent.getInheritedArgs ? parent.getInheritedArgs() : {};

        args = {...inheritedArgs, ...args};

        return new Context({receive, args, scope, id});
    }

    /**
     * @param {Object} args
     * @param {Function|null} [receive = null] Realtime event receiver
     * @param {Context|null} [parent = null] Parent context
     * @returns {Promise}
     */
    execute(args = {}, receive = null, parent = null) {
        const context = this.makeContext(args, receive, parent);
        return withActionLifecycle(context, this, () => this.run(context));
    }
}

module.exports = Action;