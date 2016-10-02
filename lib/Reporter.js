'use strict';

const _ = require('lodash');

class Reporter {

    constructor(context) {
        this.context = context;
    }

    /**
     * Report the instantiation of a new context
     */
    begin() {
        this.report({
            begin: {
                parent: this.context.parent,
                scope:  this.context.scope
            }
        });
    }

    /**
     *
     * @param action
     */
    run(action) {
        this.report({runAction: action.getName()});
    }

    /**
     * Report the occurrence of an error
     * @param {Error} error
     */
    error(error) {
        this.report({error: error.message});
    }

    /**
     * Report the completion of the primary action within the context of this reporter
     */
    done() {
        this.report({done: true});
    }

    /**
     * Report the result (i.e. return value) of the primary action within the context of this reporter
     * @param result
     */
    result(result) {
        this.report({result: {data: result}});
    }

    /**
     * Write a log line
     * @param level
     * @param data
     */
    log(level = "info", data = {}) {
        this.report({log: {level, data}});
    }

    /**
     * Send the given object to the output, including the context and timestamp
     * @param data
     */
    report(data = {}) {
        console.log(JSON.stringify(_.extend({
            context:   this.context.id,
            timestamp: (new Date()).getTime()
        }, data)));
    }
}

module.exports = Reporter;