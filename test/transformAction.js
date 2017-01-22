'use strict';

require('./support');

const sinon = require('sinon');

const transformAction = require('./../lib/transformAction');

describe('transformAction', () => {

    it('should accept an anonymous function as an action', () => {

        let anonymousAction = function iAmAnonymous(context, args) {
        };

        anonymousAction.description = 'Some anonymous action';

        let action = transformAction(anonymousAction);

        action.getName().should.equal('i-am-anonymous');

        action.getDescription().should.equal('Some anonymous action');
    });

    it('should invoke the anonymous function as if it were the run method of the action', () => {

        let callSpy = sinon.spy();

        let action = transformAction(function iAmAnonymous(context, args) {
            callSpy(context, args);
        });

        return action.executeApi({very: 'coolStuff'}).then(() => {

            callSpy.should.have.been.calledWith(sinon.match.any, sinon.match({very: 'coolStuff'}))
        });
    })
});