#!/usr/bin/env node

'use strict';

const Shipment = require('./../../lib/Shipment');
const Action   = require('./../../lib/Action');
const Promise  = require('bluebird');

const functionify = require('functionify');

/**
 * Generates an instance of shipment with some test commands. If the spy argument is provided, this function
 * will be invoked every time an action is run, with the action instance as the first argument.
 * @param {Function} [spy]
 * @returns {Shipment}
 */
let testCli = spy => {

    spy = functionify(spy);

    const DoSomething       = class DoSomething extends Action {
        run(context, options) {
            spy(this);
            return 'did something';
        }
    };
    DoSomething.description = 'Does something';

    const DoSomethingElseAction = class DoSomethingElseAction extends Action {
        run(context, options) {
            spy(this);
            return 'did something else';
        }
    };
    const FailAction            = class FailAction extends Action {
        run(context, options) {
            spy(this);
            throw new Error('something went awfully wrong');
        }
    };

    const ToUpperAction     = class ToUpperAction extends Action {
        run(context, options) {
            var toUpperCase = options.message.toUpperCase();
            return toUpperCase;
        }

        parseArgs(args) {
            return {message: args.message};
        }
    };
    const ReturnValueAction = class ReturnValueAction extends Action {
        run(context, options) {
            return Promise.delay(20).then(() => 'some return value');
        }
    };
    const PassArgsAction    = class PassArgsAction extends Action {
        run(context, options) {
            return Promise.delay(1000).then(() => {
                console.log('Hoi');
            });
        }

        parseArgs(args) {
            return args;
        }
    };
    return new Shipment([
        DoSomething,
        DoSomethingElseAction,
        FailAction,
        ToUpperAction,
        ReturnValueAction,
        PassArgsAction
    ]);
};

if (require.main === module) {
    let shipment = testCli();
    shipment.cli();
}
else module.exports = testCli;