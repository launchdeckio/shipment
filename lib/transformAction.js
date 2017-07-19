'use strict';

const _ = require('lodash');

const BaseAction = require('./Action');

/**
 * Check if the given klass is a class and it is equal to or extends the given superKlass
 * @param {Class} klass
 * @param {Class} superKlass
 * @return {boolean}
 */
const isSuper = (klass, superKlass) => {
    return klass.prototype &&
        (
            klass === superKlass ||
            klass.prototype instanceof superKlass
        );
};

/**
 * Transform the given action (either class, instance or anonymous function) into a standardized instance of Action
 * @param {Class|Action|Function} action
 * @returns {Action}
 */
const transformAction = action => {

    // Check if action is a class that inherits BaseAction
    if (isSuper(action, BaseAction))
        return new action();

    // Check if action is an instance of BaseAction
    else if (action instanceof BaseAction)
        return action;

    // Check if action is simply an anonymous function
    else if (_.isFunction(action)) {

        let BaseClass = action.base ? action.base : BaseAction;

        if (!isSuper(BaseClass, BaseAction))
            throw new TypeError('Action.super must extend BaseAction');

        let Action = class extends BaseClass {
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
