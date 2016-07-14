'use strict';

const _       = require('lodash');
const Context = require('./Context');
const sprintf = require('sprintf-js').sprintf;

class Action {

    /**
     * Perform the action
     * @param {Context} context
     * @param {Object} options
     */
    run(context, options) {
        throw new Error(sprintf('Run method not implemented for %s', this.getName()));
    }

    /**
     * Invoked before "run"
     * @param context
     * @param options
     */
    beforeRun(context, options) {
        return null;
    }

    /**
     * Invoked after "run"
     * @param context
     * @param options
     */
    afterRun(context, options) {
        return null;
    }

    /**
     * Get the command description
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
        const matches = /(\w+)(?:Action)?/.exec(this.constructor.name);
        return matches ? _.kebabCase(matches[1]) : null;
    }

    /**
     * Provision the yargs instance with this command's options
     * @param yargs
     */
    describeCommand(yargs) {
        _.forEach(this.getAvailableOptions(), option => option.transformYargs(yargs));
        return yargs;
    }

    /**
     * Invoked when the action has completed successfully
     * @param {Context} context
     */
    onSuccess(context) {
        context.reporter.onSuccess(this, context.getUptime());
    }

    /**
     * Invoked when an error is thrown during the execution of the action
     * @param {Context} context
     * @param {Error} error
     */
    onError(context, error) {
        context.reporter.onError(this, error, context.getUptime());
    }

    /**
     * Get the available options for this action
     * @returns {Option[]}
     */
    getAvailableOptions() {
        return [
            require('./options/verbose')
        ];
    }

    /**
     * Get default options for Context
     * @returns {Object}
     */
    getContextDefaults() {
        return {};
    }

    /**
     * Get options for Context based on the given arguments
     * @param {Object} argv
     * @returns {Object}
     */
    getContextOptions(argv) {
        let options = this.getContextDefaults();
        _.forEach(this.getAvailableOptions(), option => option.transformContextOptions(options, argv));
        return options;
    }

    /**
     * Make a Context instance based on the given arguments
     * @param {Object} argv
     * @returns {Context}
     */
    makeContext(argv) {
        return new (this.constructor.Context)(this.getContextOptions(argv));
    }

    /**
     * Run the command
     * @param argv
     */
    executeCommand(argv) {
        const context = this.makeContext(argv);
        const options = this.parseArgv(argv);
        return Promise.resolve(this.beforeRun(context, options))
            .then(() => this.run(context, options))
            .then(() => this.afterRun(context, options))
            .then(() => this.onSuccess(context))
            .catch(e => this.onError(context, e));
    }

    /**
     * Turn the argv object into an options object
     * @param argv
     * @returns {Object}
     */
    parseArgv(argv) {
        return {};
    }

    /**
     * Register the action into the yargs configuration
     * @param yargs
     */
    register(yargs) {
        return yargs.command(
            this.getName(),
            this.getDescription(),
            yargs => this.describeCommand(yargs),
            argv => this.executeCommand(argv)
        );
    }
}
Action.Context = Context;

module.exports = Action;