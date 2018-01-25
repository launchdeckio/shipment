'use strict';

const {result, runAction, done, error} = require('./events');

const Context = require('./Context');

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

        const inheritedOptions = parent && parent.getInheritedOptions ? parent.getInheritedOptions() : {};
        const id               = parent && parent.getSubId ? parent.getSubId() : undefined;

        return new Context(
            receive,
            {...inheritedOptions, ...options},
            {action: this.name},
            id
        );
    }

    /**
     * Execute the action and related hooks in order within the given context
     * @param context
     * @param args
     * @returns {Promise}
     */
    async execute(context, args) {
        context.emit(runAction(this));
        try {
            // Invoke the main "run" method
            const data = await this.run(context, args);
            context.emit(result(context, data));
            context.emit(done());
            return data;
        } catch (e) {
            // Display the error, and rethrow it
            context.emit(error(e.message));
            throw e;
        }
    }

    /**
     * Run the action via the API
     * @param {Function} receive
     * @param {Object} args
     * @param {String} [parent = null] Parent context uuid
     * @returns {Promise}
     */
    executeApi(receive, args = {}, parent = null) {
        const context = this.makeContext(receive, args, parent);
        return this.execute(context, args);
    }
}

module.exports = Action;