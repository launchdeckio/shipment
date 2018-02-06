const _yargs                = require('yargs');
const {mapValues, isString} = require('lodash');

const CliActionMeta = require('./CliActionMeta');
const CliOption     = require('./CliOption');

const defaultFormatter = require('./defaultFormatter');

const Parser = require('../parse/Parser');

const wrapMiddleware = require('./../common/wrapMiddleware');

const formatterToMiddleware = formatterFactory => args => {
    const formatter = formatterFactory(args);
    return (next, evt, info, line) => {
        line = !line ? formatter(evt, info, line) : line;
        return next(evt, info, line);
    };
};

class CliWrapper {

    constructor(shipment, {

        options = [],
        actions: actionMetas = {},
        withYargs,
        enableHelp = true,
        enableVerbose = true,
        outputStream = process.stdout,
        formatters = [],
        middleware = [],

    } = {}) {

        this.shipment      = shipment;
        this.options       = mapValues(options, CliOption.transform);
        this.actionMeta    = mapValues(actionMetas, CliActionMeta.transform);
        this.withYargs     = withYargs;
        this.enableHelp    = enableHelp;
        this.enableVerbose = enableVerbose;
        this.outputStream  = outputStream;

        this.middleware = formatters.map(formatterToMiddleware).concat(middleware);
    }

    getMeta(actionName) {
        if (actionName in this.actionMeta) return this.actionMeta[actionName];
        else return new CliActionMeta({name: actionName});
    }

    getHandler(actionNam, meta) {
        const action = this.shipment.actions[actionNam];
        return argv => {
            const receive = this.getReceiver(argv);
            const args    = meta.toArgs(argv);
            return action.execute(args, receive).catch(e => {
                process.exit(1);
            });
        };
    }

    getFormatter(args) {
        const defaultMiddleware = formatterToMiddleware(defaultFormatter);

        const middleware = [defaultMiddleware]
            .concat(this.middleware)
            .map(mf => mf(args));

        const final = (evt, info, line = null) => line;

        const format = wrapMiddleware(final, middleware);

        return Parser.wrap((evt, info) => {
            const line = format(evt, info);
            if (line) this.outputStream.write(line + '\n');
        });
    }

    getReceiver(args) {
        const format = this.getFormatter(args);
        return evt => {
            const line = format(evt);
            if (line) this.outputStream.write(`${line}\n`);
        };
    }

    apply(yargs) {

        for (const option in this.options)
            yargs = this.options[option].apply(yargs);

        for (const actionName in this.shipment.actions) {
            const meta    = this.getMeta(actionName);
            const handler = this.getHandler(actionName, meta);
            yargs         = meta.apply(yargs, handler);
        }

        if (this.enableVerbose) yargs = yargs.option('v', {
            describe: 'Extra chatty mode',
            alias:    'verbose',
        }).count('verbose');

        if (this.enableHelp) yargs = yargs.help().alias('h', 'help');

        yargs = yargs.demandCommand(1, 'You need at least one command before moving on');

        if (this.withYargs) yargs = this.withYargs(yargs);

        return yargs;
    }

    exec(argv = null) {
        if (argv === null) argv = isString(argv) ? argv : process.argv.splice(2).join(' ');
        const yargs = this.apply(_yargs);
        return yargs.parse(argv);
    }
}

module.exports = CliWrapper;