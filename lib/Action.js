'use strict';

const {result, runAction, done, error} = require('./events');

const Context = require('./Context');

const withActionLifecycle = async (context, action, fn) => {

    context.emit(runAction(action));

    try {

        const data = await fn();

        context.emit(result(context, data));
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
     * @param {Object} options
     * @param {Context|null} [parent = null] Parent context instance
     * @returns {Context}
     */
    makeContext(receive, options, parent = null) {

        const scope            = {action: this.name};
        const id               = parent && parent.newBranchId ? parent.newBranchId() : '0';
        const inheritedOptions = parent && parent.getInheritedOptions ? parent.getInheritedOptions() : {};

        options = {...inheritedOptions, ...options};

        return new Context(receive, options, scope, id);
    }

    /**
     * @param {Function} receive
     * @param {Object} args
     * @param {Context|null} [parent = null] Parent context
     * @returns {Promise}
     */
    execute(receive, args = {}, parent = null) {
        const context = this.makeContext(receive, args, parent);
        return withActionLifecycle(context, this, () => this.run(context));
    }
}

module.exports = Action;