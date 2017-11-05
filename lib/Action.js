'use strict';

const {kebabCase, extend, reduce} = require('lodash');

const Context = require('./Context');

class Action {

    /**
     * Perform the action
     * @param {Context} context
     * @param {Object} [options = {}]
     */
    run(context, options = {}) { //eslint-disable-line no-unused-vars
    }

    /**
     * Invoked before "run"
     * @param context
     * @param options
     */
    beforeRun(context, options) { //eslint-disable-line no-unused-vars
    }

    /**
     * Invoked after "run"
     * @param context
     * @param options
     */
    afterRun(context, options) { //eslint-disable-line no-unused-vars
    }

    /**
     * Get the action description
     * @returns {String}
     */
    getDescription() {
        return this.constructor.description ? this.constructor.description : '';
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
     * @param {Boolean} [cli = false] Whether we're in CLI mode
     * @param {String|Context} [parent = null] Parent context instance or context ID
     * @param {Object} [optionOverrides = {}] Additional options to override at the Context.options level (deprecated)
     *                                        The usage of this parameter is discouraged in favor of having
     *                                        Contexts inherit properties from a parent context.
     * @returns {Context}
     */
    makeContext(args, cli = false, parent = null, optionOverrides = {}) {
        const optionsFromArgs  = this.parseContextArgs(args, cli);
        const inheritedOptions = parent ? parent.getInheritedOptions() : {};
        const options          = extend({}, inheritedOptions, optionsFromArgs, {cli}, optionOverrides);
        const scope            = this.prepareScope();
        let parentId           = parent;
        if (parent instanceof Context) parentId = parent.id;
        return new (this.constructor.Context)(options, scope, parentId);
    }

    /**
     * Get the available options for this action
     * @param {Boolean} [cli=false]
     * @returns {Option[]}
     */
    getAvailableOptions(cli) {
        return [
            require('./options/verbose'),
        ].concat(cli ? [
            require('./options/raw')
        ] : [
            require('./options/cwd'),
        ]);
    }

    /**
     * Get default options for Context
     * @param {Boolean} cli
     * @returns {Object}
     */
    getContextDefaults(cli) { //eslint-disable-line no-unused-vars
        return {};
    }

    /**
     * Get the scope that will be passed to the context constructor by default
     * @returns {Object}
     */
    prepareScope() {
        return {action: this.getName()};
    }

    /**
     * Report the return value of the run method
     * @param {Context} context
     * @param {*} result
     */
    outputResult(context, result) {
        context.emit.result(result);
    }

    /**
     * Report that the action is about to run
     * @param {Context} context
     */
    onBeforeRun(context) {
        context.emit.runAction(this);
        if (!context.options.cli && context.options.cwd)
            process.chdir(context.options.cwd);
    }

    /**
     * Invoked when the action has completed successfully
     * @param {Context} context
     */
    onSuccess(context) {
        context.emit.done();
    }

    /**
     * Invoked when an error is thrown during the execution of the action, and the execution must be halted
     * @param {Context} context
     * @param {Error} error
     */
    onError(context, error) {
        context.emit.error(error);
    }

    /**
     * Execute the action and related hooks in order within the given context
     * @param context
     * @param args
     * @returns {Promise}
     */
    async execute(context, args) {
        let result;
        const options = this.parseArgs(args);
        this.onBeforeRun(context);
        try {
            await this.beforeRun(context, options);

            // Invoke the main "run" method
            result = await this.run(context, options);

            // Output return value
            await this.outputResult(context, result);

            // Do "afterRun"
            await this.afterRun(context, options);

            // If all is going well so far, invoke onSuccess
            // so it becomes clear this action is done running
            await this.onSuccess(context);
            return result;
        } catch (e) {
            // Display the error, and rethrow it
            this.onError(context, e);
            throw e;
        }
    }

    /**
     * Run the action from the CLI
     * @param {Object} args
     * @param {Number} [exitCodeOnError = 1]
     * @param {String|Context} [parent = null] Parent context instance or context ID
     * @returns {Promise}
     */
    async executeCli(args, exitCodeOnError, parent = null) {
        const context = this.makeContext(args, true, parent);
        try {
            return await this.execute(context, args);
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
            if (exitCodeOnError !== 0)
                process.on('exit', () => process.exit(exitCodeOnError));
        }
    }

    /**
     * Run the action via the API
     * @param {Object} args
     * @param {String} [parent = null] Parent context uuid
     * @param {Object} [optionOverrides = {}] Context option overrides
     * @returns {Promise}
     */
    executeApi(args = {}, parent = null, optionOverrides = {}) {
        const context = this.makeContext(args, false, parent, optionOverrides);
        return this.execute(context, args);
    }

    /**
     * Turn the args object into an options object
     * @param {Object} [args = {}]
     * @returns {Object}
     */
    parseArgs(args = {}) {
        return args;
    }

    /**
     * Get options for Context based on the given arguments
     * @param {Object} args
     * @param {Boolean} cli Whether we're in CLI mode
     * @returns {Object}
     */
    parseContextArgs(args, cli) {
        return reduce(this.getAvailableOptions(cli), (contextOptions, option) => {
            option.transformContextOptions(contextOptions, args);
            return contextOptions;
        }, this.getContextDefaults(cli));
    }

    /**
     * Provision the yargs instance with this action's options
     * @param yargs
     */
    describeAction(yargs) {
        return reduce(this.getAvailableOptions(true), (yargs, option) => {
            option.transformYargs(yargs);
            return yargs;
        }, yargs);
    }

    /**
     * Register the action into the yargs configuration
     * @param yargs
     * @param {Number} [exitCodeOnError = 1] What exitcode to use on error?
     */
    register(yargs, exitCodeOnError = 1) {
        return yargs.command(
            this.getName(),
            this.getDescription(),
            yargs => this.describeAction(yargs),
            args => this.executeCli(args, exitCodeOnError),
        );
    }
}

// The Context class associated with the action should
// be registered as a constant on the action class
Action.Context = Context;

module.exports = Action;