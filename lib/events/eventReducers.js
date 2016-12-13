'use strict';

const _      = require('lodash');
const chalk  = require('chalk');
const events = require('./events');

const log = fn => (data, info) => console.log(fn(data, info));

/**
 * Stock event reducers for the base context
 * @param parser
 * @param options
 */
module.exports = (parser, options = {}) => {

    if (options.format) {

        /* jshint -W086 */
        //noinspection FallThroughInSwitchStatementJS
        switch (options.verbosity) {
            case 4: //todo this could be more optimal
            case 3:
            case 2:
            case 1:
                parser.useCombine({

                    [events.RUN_ACTION]: log(action => chalk.bold(`\n> ${action}\n`)),
                    [events.DONE]:       log((_, info) => chalk.green(`\n✔ [${info.context.scope.action}]\n`))
                });
            default:
                parser.useCombine({

                    [events.RESULT]: (result, info) => {
                        const data = result.get('data');
                        if (_.isUndefined(data))
                            console.log(options.verbosity >= 2 ? chalk.grey(`${info.context.scope.action} returned undefined`) : '');
                        else if (_.isString(data) || _.isNumber(data)) console.log(data);
                        else console.log(JSON.stringify(data, null, 2));
                    },
                    [events.ERROR]:  log(error => chalk.red(`\n${error}\n`))
                });
        }
        /* jshint +W086 */

    }
    if (!options.format || options.verbosity >= 2) {

        parser.useFinal((_1, _2, obj) => {

            process.stdout.write(JSON.stringify(obj) + '\n');
            // TODO this isn't quite optimal since the objects _1 (`immutable`) and _2 (`info`) are unnecessary
            // but were separated at the parser regardless
        });
    }
};