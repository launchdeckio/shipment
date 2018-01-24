'use strict';

const {isObject} = require('lodash');

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
     * @param {String|Context} [parent = null] Parent context instance or context ID
     * @returns {Context}
     */
    makeContext(receive, options, parent = null) {

        const supportsInheritedOptions = isObject(parent) && parent.getInheritedOptions;

        const inheritedOptions = supportsInheritedOptions ? parent.getInheritedOptions() : {};

        // TODO if a primitive parent ID is passed in, that might mean
        // we're in a different process and thus we should create a new "subnet"
        const parentId = isObject(parent) ? parent.id : parent;

        return new Context(receive,
            {...inheritedOptions, ...options},
            {action: this.getName()},
            parentId
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