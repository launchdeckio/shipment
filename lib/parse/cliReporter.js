'use strict';

const _     = require('lodash');
const chalk = require('chalk');

const combineHandlers = require('./combineHandlers');

module.exports = (parser, options) => {

    let verbosity = options.verbosity;

    if (verbosity >= 2) {
        // eventParser.on('')
    }

    if (verbosity >= 1) {

        parser.use({

            runAction: action => console.log(`\n> [${action}]\n`),
            done:      (_, info) => console.log(chalk.green(`\n✔ [${info.context.scope.action}]\n`))
        });
    }

    parser.use({

        result: result => {
            const data = result.get('data');
            if (_.isString(data) || _.isNumber(data)) console.log(data);
            else console.log(JSON.stringify(data, null, 2));
        }
    });
};