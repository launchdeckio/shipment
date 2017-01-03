'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

const ShipmentServer  = require('./ShipmentServer');
const transformAction = require('./transformAction');

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
     * Get the app name as a string
     * Per default this is based on the contents of the pkg object passed to the constructor
     *
     * @returns {String|undefined}
     */
    getAppName() {
        return this.options.pkg ? this.options.pkg.name : undefined;
    }

    /**
     * Generate an object describing the application,
     * available actions and their options
     *
     * @returns {Object}
     */
    manual() {

        let actions = _(this.actions)
            .map(action => [action.getName(), {
                description: action.getDescription(),
                options:     _.map(action.getAvailableOptions(false), option => option.name),
            }])
            .fromPairs()
            .value();

        return {
            name:    this.getAppName(),
            version: this.options.pkg ? this.options.pkg.version : undefined,
            actions,
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