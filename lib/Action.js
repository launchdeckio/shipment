'use strict';

const {kebabCase, extend, isObject} = require('lodash');

const {result, runAction, done, error} = require('./events');

class Action {

    constructor({name, run, description = null}) {
        this.name        = name;
        this.run         = run;
        this.description = description;
    }

    /**
     * By default, deduce the name of the action from the class name
     * @returns {String|null}
     */
    getName() {
        const matches = /^(\w+?)(?:Action)?$/.exec(this.constructor.name);
        return matches ? kebabCase(matches[1]) : null;
    }

    /**
     * Make an action wrapper runtime Context instance based on the given arguments
     * @param {Object} args Base arguments
     * @param {String|Context} [parent = null] Parent context instance or context ID
     * @returns {Context}
     */
    makeContext(args, parent = null) {

        // Determine whether an object with a method named "getInheritedOptions" was passed in
        // presumably this would be an instance of the Context class but if we were to strictly
        // check if that were the case (`parent instanceof Context`) the type check might produce
        // inconsistent results, for example when multiple versions of shipment are installed
        // across different dependencies
        const supportsInheritedOptions = isObject(parent) && parent.getInheritedOptions;

        const inheritedOptions = supportsInheritedOptions ? parent.getInheritedOptions() : {};
        const options          = extend({}, inheritedOptions, args);
        const scope            = this.prepareScope();

        // TODO if a primitive parent ID is passed in, that might mean
        // we're in a different process and thus we should create a new "subnet"
        const parentId = isObject(parent) ? parent.id : parent;

        return new (this.constructor.Context)(options, scope, parentId);
    }

    /**
     * Get the scope that will be passed to the context constructor by default
     * @returns {Object}
     */
    prepareScope() {
        return {action: this.getName()};
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
     * @param {Object} args
     * @param {String} [parent = null] Parent context uuid
     * @returns {Promise}
     */
    executeApi(args = {}, parent = null) {
        const context = this.makeContext(args, parent);
        return this.execute(context, args);
    }
}

module.exports = Action;