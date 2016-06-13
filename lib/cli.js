'use strict';

const _              = require('lodash');
const updateNotifier = require('update-notifier');

/**
 * Expose a CLI with given actions as subcommands
 * @param {Array} actions Array of subclasses of Action
 * @param {Object} pkg The package.json contents
 * @returns {Array}
 */
module.exports = function (actions, pkg) {

    updateNotifier({pkg}).notify();

    const yargs = require('yargs').usage('$0 <cmd> [args]');

    _.each(actions, Action => (new Action()).register(yargs));

    return yargs
        .help('h')
        .version()
        .alias('h', 'help')
        .argv;
};
