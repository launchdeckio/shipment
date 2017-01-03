'use strict';

require('./support');

const sinon = require('sinon');

const transformAction = require('./../lib/transformAction');

describe('transformAction', () => {

    it('should accept an anonymous function as an action', () => {

        let action = transformAction(function iAmAnonymous(context, args) {
        });

        action.getName().should.equal('i-am-anonymous');
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