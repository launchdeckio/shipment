'use strict';

const {isUndefined, isString, isNumber} = require('lodash');

const chalk = require('chalk');

module.exports = (verbosity, output = process.stdout) => {

    const verbose = verbosity >= 1 ? {
        runAction(action) {
            // process.stdout.write(chalk.)
            output.write(chalk.bold(`\n> ${action}\n`));
        },
        done(_, info) {
            output.write(chalk.green(`\n✔ [${info.context.scope.action}]\n`));
        },
    } : {};

    return {
        ...verbose,
        result(result, info) {
            const data = result.get('data');
            if (isUndefined(data)) {
                if (verbosity >= 2)
                    output.write(chalk.grey(`${info.context.scope.action} returned undefined`));
            }
            else if (isString(data) || isNumber(data)) output.write(data);
            else output.write(JSON.stringify(data, null, 2));
        }
    };
};