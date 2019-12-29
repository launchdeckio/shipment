const Context = require('./Context');

const withActionLifecycle = require('./withActionLifecycle');

class Action {

    constructor({name, run, description = null}) {
        this.name        = name;
        this._run        = run;
        this.description = description;
    }

    run(...args) {
        return this._run(...args);
    }

    /**
     * Make an action wrapper runtime Context instance based on the given arguments
     * @param {Function} receive
     * @param {Object} args
     * @param {Context|null} [parent = null] Parent context instance
     * @returns {Context}
     */
    makeContext(args = {}, receive = null, parent = null) {
        const scope = {action: this.name};
        return parent ?
            parent.branch(scope, receive, args) :
            new Context({receive, args, scope});
    }

    /**
     * @param {Object} [runActionMeta] Optionally supply some metadata that will be
     *                              emitted as part of the "runAction" event
     * @param {Object} args
     * @param {Function|null} [receive = null] Realtime event receiver
     *  (note this function will work as "wrapReceive" when a parent context is given)
     * @param {Context|null} [parent = null] Parent context
     * @returns {Promise}
     */
    execute({runActionMeta = undefined, ...args} = {}, receive = null, parent = null) {
        const context = this.makeContext(args, receive, parent);
        return withActionLifecycle(context, this, () => this.run(context), runActionMeta);
    }

    static transform(spec, name) {
        if (spec instanceof Action) return spec;
        else return new Action({name, run: spec});
    }
}

module.exports = Action;
