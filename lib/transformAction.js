'use strict';

const _ = require('lodash');

const BaseAction = require('./Action');

/**
 * Transform the given action (either class, instance or anonymous function) into a standardized instance of Action
 * @param {Class|Action|Function} action
 * @returns {Action}
 */
const transformAction = action => {

    // Check if action is a class that inherits BaseAction
    if (action.prototype && action.prototype instanceof BaseAction)
        return new action();

    // Check if action is an instance of BaseAction
    else if (action instanceof BaseAction)
        return action;

    // Check if action is simply an anonymous function
    else if (_.isFunction(action)) {
        let Action = class extends BaseAction {
            run(context, args) {
                return action(context, args);
            }

            getName() {
                return _.kebabCase(action.name);
            }
        };
        Action.description = action.description;
        return new Action();
    }

    else throw new TypeError('Invalid type given, cannot use ' + action + ' as an action');
};

module.exports = transformAction;
