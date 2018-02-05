const _yargs                = require('yargs');
const {mapValues, isString} = require('lodash');

const CliActionMeta = require('./CliActionMeta');
const CliOption     = require('./CliOption');

const consoleReporter = require('./consoleReporter');

const Parser = require('../parse/Parser');

class CliWrapper {

    constructor(shipment, {

        options = [],
        actions: actionMetas = {},
        withYargs,
        enableHelp = true,
        enableVerbose = true,
        outputStream = process.stdout,

    } = {}) {

        this.shipment      = shipment;
        this.options       = mapValues(options, CliOption.transform);
        this.actionMeta    = mapValues(actionMetas, CliActionMeta.transform);
        this.withYargs     = withYargs;
        this.enableHelp    = enableHelp;
        this.enableVerbose = enableVerbose;
        this.outputStream  = outputStream;
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
            return action.execute(args, receive);
        };
    }

    getReceiver(argv) {
        const toConsole = consoleReporter(argv);
        return Parser.wrap((evt, info) => {
            const line = toConsole(evt, info);
            if (line !== undefined)
                this.outputStream.write(`${line}\n`);
        });
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