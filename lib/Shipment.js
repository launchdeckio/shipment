'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

class Shipment {

    /**
     * @param {Array.<Function>} [actions = []] Array of subclasses of Action
     * @param {Object} [options = {}]
     * @param {Object} [options.pkg] The package.json contents. If provided,
     *                               will use update-notifier to check for updates
     * @returns {Array}
     */
    constructor(actions = [], options = {}) {
        this.options = options;
        this.actions = actions;
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

        _.each(this.actions, Action => (new Action()).register(yargs));

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
        _.each(this.actions, Action => {
            let action                         = new Action();
            obj[_.camelCase(action.getName())] = action.executeApi.bind(action);
        });
        return obj;
    }
}
Shipment.updateNotifier = updateNotifier;

module.exports = Shipment;

module.exports.Action        = require('./Action');
module.exports.Context       = require('./Context');
module.exports.GracefulError = require('./GracefulError');
module.exports.Option        = require('./Option');
module.exports.Reporter      = require('./Reporter');