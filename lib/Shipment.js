'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

class Shipment {

    /**
     * @param {Array} actions Array of subclasses of Action
     * @param {Object} [options = {}]
     * @param {Object} [options.pkg] The package.json contents. If provided, will use update-notifier to check for updates
     * @returns {Array}
     */
    constructor(actions, options) {
        if (!options) options = {};
        this.options = options;
        this.actions = actions;
    }

    /**
     * Expose the CLI
     * @returns argv
     */
    cli() {
        if (this.options.pkg)
            updateNotifier({pkg: this.options.pkg}).notify();

        const yargs = require('yargs').usage('$0 <cmd> [args]');

        _.each(this.actions, Action => (new Action()).register(yargs));

        return yargs
            .help('h')
            .version()
            .alias('h', 'help')
            .argv;
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

module.exports = Shipment;

module.exports.Action        = require('./Action');
module.exports.Context       = require('./Context');
module.exports.GracefulError = require('./GracefulError');
module.exports.Option        = require('./Option');
module.exports.Reporter      = require('./Reporter');