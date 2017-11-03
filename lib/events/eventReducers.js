'use strict';

const _     = require('lodash');
const chalk = require('chalk');

const events = require('./events');

const log = fn => (data, info) => console.log(fn(data, info)); // eslint-disable-line no-console

/**
 * Default event reducers (handlers) for the base Shipment Context class
 * @param parser
 * @param options
 */
module.exports = (parser, options = {}) => {

    if (options.format) {

        /* eslint-disable indent, no-console, no-fallthrough */
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
                        if (_.isUndefined(data)) {
                            if (options.verbosity >= 2)
                                console.log(chalk.grey(`${info.context.scope.action} returned undefined`));
                        }
                        else if (_.isString(data) || _.isNumber(data)) console.log(data);
                        else console.log(JSON.stringify(data, null, 2));
                    },
                    [events.ERROR]:  log(error => chalk.red(`\n${error}\n`))
                });
        }
        /* eslint-enable */

    }
    if (!options.format || options.verbosity >= 2) {

        const outputStream = options.outputStream ? options.outputStream : process.stdout;

        parser.useFinal((_1, _2, obj) => {

            outputStream.write(JSON.stringify(obj) + '\n');
            // TODO this isn't quite optimal since the objects _1 (`immutable`) and _2 (`info`) are unnecessary
            // but were separated at the parser regardless
        });
    }
};