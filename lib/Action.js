'use strict';

const _       = require('lodash');
const Context = require('./Context');
const Promise = require('bluebird');

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
        return matches ? _.kebabCase(matches[1]) : null;
    }

    /**
     * Make an action wrapper runtime Context instance based on the given arguments
     * @param {Object} args Base arguments
     * @param {Boolean} [cli = false] Whether we're in CLI mode
     * @param {String} [parent = null] Optional parent context
     * @param {Object} [optionOverrides = {}] Additional options to override at the Context.options level
     * @returns {Context}
     */
    makeContext(args, cli = false, parent = null, optionOverrides = {}) {
        const optionsFromArgs = this.parseContextArgs(args, cli);
        const options         = _.extend({}, optionsFromArgs, {cli}, optionOverrides);
        const scope           = this.prepareScope();
        return new (this.constructor.Context)(options, scope, parent);
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
    execute(context, args) {
        let r;
        const options = this.parseArgs(args);
        this.onBeforeRun(context);
        // Wrap the "beforeRun" result in Promise.resolve just to make sure we can use it as a thenable
        return Promise.resolve(this.beforeRun(context, options))
        // Invoke the main "run" method
            .then(() => this.run(context, options))
            // Store the return value so that we can fulfill the promise with it later
            .then(result => r = result)
            // Output return value
            .then(() => this.outputResult(context, r))
            // Do "afterRun"
            .then(() => this.afterRun(context, options))
            // If all is going well so far, invoke onSuccess so it becomes clear this action is done running
            .then(() => this.onSuccess(context))
            // Display the error, and rethrow it
            .catch(e => {
                this.onError(context, e);
                throw e;
            })
            // Fulfill the promise with the return value from the "run" method
            .then(() => r);
    }

    /**
     * Run the action from the CLI
     * @param {Object} args
     * @param {Number} [exitCodeOnError = 1]
     * @param {String} [parent = null] Parent context uuid
     * @returns {Promise}
     */
    executeCli(args, exitCodeOnError, parent = null) {
        const context = this.makeContext(args, true, parent);
        return Promise.resolve(this.execute(context, args))
            .catch(() => {
                if (exitCodeOnError !== 0)
                    process.on('exit', () => process.exit(exitCodeOnError));
            });
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
     * @param {Boolean} cli
     * @returns {Object}
     */
    parseContextArgs(args, cli) {
        let options = this.getContextDefaults(cli);
        _.forEach(this.getAvailableOptions(cli), option => option.transformContextOptions(options, args));
        return options;
    }

    /**
     * Provision the yargs instance with this action's options
     * @param yargs
     */
    describeAction(yargs) {
        _.forEach(this.getAvailableOptions(true), option => option.transformYargs(yargs));
        return yargs;
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
            args => this.executeCli(args, exitCodeOnError).done()
        );
    }
}

Action.Context = Context;

module.exports = Action;