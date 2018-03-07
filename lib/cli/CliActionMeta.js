const {mapValues, isString} = require('lodash');

const CliOption = require('./CliOption');

class CliActionMeta {

    constructor({
        name,
        description = '',
        options = [],
        toArgs = null,
    } = {}) {
        this.name        = name;
        this.description = description;
        this.options     = mapValues(options, CliOption.transform);
        this._toArgs     = toArgs;
    }

    /**
     * Return a function that will "apply" the
     * available options to the yargs instance.
     * @returns {function}
     */
    get builder() {
        return yargs => {
            for (const option in this.options)
                yargs = this.options[option].apply(yargs);
            yargs = yargs.help();
            return yargs;
        };
    }

    toArgs(argv) {
        return this._toArgs ? this._toArgs(argv) : argv;
    }

    apply(yargs, handler) {
        return yargs.command(this.name, this.description, this.builder, handler);
    }

    static transform(spec, name) {
        if (spec instanceof CliActionMeta) return spec;
        else return isString(spec) ?
            new CliActionMeta({name, description: spec}) :
            new CliActionMeta({name, ...spec});
    }
}

module.exports = CliActionMeta;