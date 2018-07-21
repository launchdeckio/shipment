const chalk = require('chalk');

const stringifyResult = require('../common/stringifyResult');

module.exports = ({

    verbose = 0,
    fmtInfo = chalk.grey,
    fmtError = chalk.red,
    fmtBold = chalk.bold,
    fmtSuccess = chalk.green,

} = {}) => (event, info) => { // eslint-disable-line no-unused-vars

    if (event.info) {
        return fmtInfo(event.info);
    }

    if (event.result) {
        const data = event.result.data;
        if (data === undefined) {
            if (verbose >= 2) return fmtInfo(`${event.result.action} returned undefined`);
        }
        else return stringifyResult(data);
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