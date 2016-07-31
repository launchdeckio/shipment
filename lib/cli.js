'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

/**
 * Expose a CLI with given actions as subcommands
 * @param {Array} actions Array of subclasses of Action
 * @param {Object} options
 * @param {Object} options.pkg The package.json contents. If provided, will use update-notifier to check for updates
 * @returns {Array}
 */
module.exports = function (actions, options) {

    if (options.pkg)
        updateNotifier({pkg: options.pkg}).notify();

    const yargs = require('yargs').usage('$0 <cmd> [args]');

    _.each(actions, Action => (new Action()).register(yargs));

    return yargs
        .help('h')
        .version()
        .alias('h', 'help')
        .argv;
};
