const _     = require('lodash');
const chalk = require('chalk');

module.exports = ({

    verbose = 0,
    fmtInfo = chalk.grey,
    fmtError = chalk.red,
    fmtBold = chalk.bold,
    fmtSuccess = chalk.green,

} = {}) => (event, info) => { // eslint-disable-line no-unused-vars

    if (event.result) {
        const data = event.result.data;
        if (data === undefined) {
            if (verbose >= 2) return fmtInfo(`${event.result.action} returned undefined`);
        }
        else if (_.isString(data) || _.isNumber(data)) return data;

        // TODO allow the ACTION to specify a custom serializer for the
        // result to the console
        else return JSON.stringify(data, null, 2);
    }

    if (event.error) {
        return fmtError(event.error.stack ? event.error.stack : event.error);
    }

    if (verbose >= 1) {
        if (event.runAction) {
            return fmtBold(event.runAction);
        }
        if (event.done) {
            return fmtSuccess(`✔ [${event.done.action}]`);
        }
    }
};