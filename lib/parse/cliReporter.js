'use strict';

const chalk = require('chalk');

const reduce = fn => obj => fn(obj.data, obj.context, obj.timestamp);

module.exports = (emitter, verbosity = 1) => {

    if (verbosity >= 2) {
        // eventParser.on('')
    }

    if (verbosity >= 1) {
        emitter.on('runAction', reduce(action => console.log(`\n> [${action}]\n`)));
        emitter.on('done', reduce((_, context) => console.log(chalk.green(`\n✔ [${context.scope.action}]\n`))))
    }

    emitter.on('result', reduce(result => console.log(JSON.stringify(result.data, null, 2))));
};