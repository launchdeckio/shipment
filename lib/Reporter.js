'use strict';

const _           = require('lodash');
const EventParser = require('./parse/EventParser');
const reportCli   = require('./parse/cliReporter');

class Reporter {

    constructor(context) {
        this.context = context;
        if (context.options.cli && !context.options.raw) {
            this.parser = new EventParser();
            this.reportCli(this.parser, context.options);
            this.send = obj => this.parser.receive(obj);
        } else {
            this.send = obj => console.log(JSON.stringify(obj));
        }
    }

    /**
     * Register listeners to the given event parser (emitter) that will report the events in a human-readable format
     * @param {Object} options
     * @param {EventEmitter} emitter
     */
    reportCli(emitter, options) {
        reportCli(emitter, options);
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
     * @param {Action} action
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
        this.send(_.extend({
            context:   this.context.id,
            timestamp: (new Date()).getTime()
        }, data));
    }
}

module.exports = Reporter;