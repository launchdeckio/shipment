'use strict';

const _       = require('lodash');
const Context = require('./Context');
const Promise = require('bluebird');
const sprintf = require('sprintf-js').sprintf;

class Action {

    /**
     * Perform the action
     * @param {Context} context
     * @param {Object} [options = {}]
     */
    run(context, options = {}) {
        throw new Error(sprintf('Run method not implemented for %s', this.getName()));
    }

    /**
     * Invoked before "run"
     * @param context
     * @param options
     */
    beforeRun(context, options) {
        if (context.cli === false && context.cwd)
            process.chdir(context.cwd);
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
        const matches = /(\w+)(?:Action)?/.exec(this.constructor.name);
        return matches ? _.kebabCase(matches[1]) : null;
    }

    /**
     * Make a Context instance based on the given arguments
     * @param {Object} args
     * @param {Boolean} [cli = false]
     * @returns {Context}
     */
    makeContext(args, cli) {
        return new (this.constructor.Context)(_.extend({}, this.parseContextArgs(args, cli), {cli: !!cli}));
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
     * @param {Boolean} cli
     * @returns {Option[]}
     */
    getAvailableOptions(cli) {
        let options = [
            require('./options/verbose')
        ];
        if (!cli) options = options.concat([
            require('./options/cwd')
        ]);
        return options;
    }

    /**
     * Get default options for Context
     * @param {Boolean} cli
     * @returns {Object}
     */
    getContextDefaults(cli) {
        return {};
    }

    /**
     * Return a function that will run the action
     * @param {Context} context
     * @param {Object} args
     * @return {Function}
     */
    prepare(context, args) {
        const options = this.parseArgs(args);
        let r;
        return () => Promise.resolve(this.beforeRun(context, options))
            .then(() => this.run(context, options))
            .then(result => r = result)
            .then(() => this.afterRun(context, options))
            .then(() => r);
    }

    /**
     * Run the action from the CLI
     * @param {Object} args
     */
    executeCli(args) {
        const context = this.makeContext(args, true);
        let exec      = this.prepare(context, args);
        return exec()
            .then(() => this.onSuccess(context))
            .catch(e => {
                this.onError(context, e);
                throw e;
            });
    }

    /**
     * Run the action via the API
     * @param {Object} args
     * @returns {Promise}
     */
    executeApi(args = {}) {
        return this.prepare(this.makeContext(args), args)();
    }

    /**
     * Turn the args object into an options object
     * @param args
     * @returns {Object}
     */
    parseArgs(args) {
        return {};
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
        _.forEach(this.getAvailableOptions(), option => option.transformYargs(yargs));
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
            args => {
                let promise = Promise.resolve(this.executeCli(args));
                if (exitCodeOnError !== 0) promise = promise.catch(e => process.on('exit', () => process.exit(1)));
                return promise.done();
            }
        );
    }
}
Action.Context = Context;

module.exports = Action;