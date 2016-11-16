'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

const BaseAction     = require('./Action');
const ShipmentServer = require('./ShipmentServer');

/**
 * Transform the given action (either class, instance or anonymous function) into a standardized instance of Action
 * @param {Class|Action|Function} action
 * @returns {Action}
 */
const transformAction = action => {

    // Check if action is a class that inherits BaseAction
    if (action.prototype && action.prototype instanceof BaseAction)
        return new action();

    // Check if action is an instance of BaseAction
    else if (action instanceof BaseAction)
        return action;

    // Check if action is simply an anonymous function
    else if (_.isFunction(action)) {
        let Action = class extends BaseAction {
            run(context, args) {
                return action(context, args);
            }

            getName() {
                return _.kebabCase(action.name);
            }
        };
        return new Action();
    }

    else throw new TypeError('Invalid type given, cannot use ' + action + ' as an action');
};

class Shipment {

    /**
     * @param {Array.<Function>} [actions = []] Array of acceptable action arguments (see transformAction)
     * @param {Object} [options = {}]
     * @param {Object} [options.pkg] The package.json contents
     * @param {String} [exportPath} The path of the module that will export this instance of Shipment.
     *                 Required for the HTTP server to work
     * @returns {Array}
     */
    constructor(actions = [], options = {}, exportPath = null) {
        this.options    = options;
        this.actions    = _.map(actions, transformAction);
        this.exportPath = exportPath;
    }

    /**
     * Generate an object describing the application,
     * available actions and their options
     *
     * @returns {Object}
     */
    manual() {
        return {
            name:    this.options.pkg ? this.options.pkg.name : undefined,
            version: this.options.pkg ? this.options.pkg.version : undefined,
            actions: _(this.actions)
                         .map(action => [action.getName(), {
                             description: action.getDescription(),
                             options:     _.map(action.getAvailableOptions(false), option => option.name),
                         }])
                         .fromPairs()
                         .value(),
        };
    }

    /**
     * Expose the CLI, parsing either the given arguments or the command line arguments
     * @param {String[]} [args]
     * @returns argv
     */
    cli(args) {
        if (this.options.pkg && !this.options.noUpdateNotifier)
            this.constructor.updateNotifier({pkg: this.options.pkg}).notify();

        let yargs = require('yargs').usage('$0 <cmd> [args]');

        _.each(this.actions, action => action.register(yargs));

        yargs = yargs
            .help('h')
            .version()
            .alias('h', 'help');

        return args ? yargs.parse(args) : yargs.argv;
    }

    /**
     * Generate an object that exposes all actions as functions
     * @returns {{}}
     */
    api() {
        let obj = {};
        _.each(this.actions, action => {
            obj[_.camelCase(action.getName())] = action.executeApi.bind(action);
        });
        return obj;
    }

    /**
     * Run HTTP server
     * @returns {http.Server}
     */
    serve(options) {
        return (new ShipmentServer(this, options)).serve();
    }
}
Shipment.updateNotifier = updateNotifier;

module.exports = Shipment;

module.exports.Action        = require('./Action');
module.exports.Context       = require('./Context');
module.exports.GracefulError = require('./GracefulError');
module.exports.Option        = require('./Option');