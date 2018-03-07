const {isString} = require('lodash');

class CliOption {

    constructor({name, alias, description, withYargs, ...more}) {
        this.name        = name;
        this.alias       = alias;
        this.description = description;
        this.withYargs   = withYargs;
        this.more        = more;
    }

    apply(yargs) {
        yargs = yargs.option(this.name, {
            alias:    this.alias,
            describe: this.description,
            ...this.more,
        });
        if (this.withYargs) yargs = this.withYargs(yargs);
        return yargs;
    }

    static transform(spec, name) {
        if (spec instanceof CliOption) return spec;
        else {
            return isString(spec) ?
                new CliOption({name, description: spec}) :
                new CliOption({name, ...spec});
        }
    }
}

module.exports = CliOption;