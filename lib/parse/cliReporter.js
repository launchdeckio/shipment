'use strict';

const _      = require('lodash');
const chalk  = require('chalk');
const events = require('./events');

const combineHandlers = require('./combineHandlers');

const log = fn => (data, info) => console.log(fn(data, info));

module.exports = (parser, options) => {

    //noinspection FallThroughInSwitchStatementJS
    switch (options.verbosity) {
        case 2:
        case 1:
            parser.use({

                [events.RUN_ACTION]: log(action => chalk.bold(`\n> ${action}\n`)),
                [events.DONE]:       log((_, info) => chalk.green(`\n✔ [${info.context.scope.action}]\n`))
            });
        default:
            parser.use({

                [events.RESULT]: result => {
                    const data = result.get('data');
                    if (_.isString(data) || _.isNumber(data)) console.log(data);
                    else console.log(JSON.stringify(data, null, 2));
                },
                [events.ERROR]:  log(error => chalk.red(`\n${error}\n`))
            });
    }
};