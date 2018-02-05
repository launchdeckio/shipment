const _     = require('lodash');
const chalk = require('chalk');

const pad = msg => `\n${msg}\n`;

module.exports = (options = {}) => (event, info) => {

    const {
              verbose: verbosity = 0,
              fmtInfo            = chalk.grey,
              fmtError           = chalk.red,
              fmtBold            = chalk.bold,
              fmtSuccess         = chalk.green,
              fmtPad             = pad,
              raw                = false,
          } = options;

    // if(options.verbose)

    if (raw) return JSON.stringify(event);

    if (event.result) {
        const data = event.result.data;
        if (data === undefined) {
            if (verbosity >= 2) return fmtInfo(`${event.result.action} returned undefined`);
        }
        else if (_.isString(data) || _.isNumber(data)) return data;

        // TODO allow the ACTION to specify a custom serializer for the
        // result to the console
        else return JSON.stringify(data, null, 2);
    }

    if (event.error) {
        return fmtError(event.error);
    }

    if (verbosity >= 1) {
        if (event.runAction) {
            return fmtBold(fmtPad(event.runAction));
        }
        if (event.done) {
            return fmtSuccess(fmtPad(`✔ [${event.done.action}]`));
        }
    }
};