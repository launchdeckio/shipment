'use strict';

require('./support/index');

const Context = require('./../lib/Context');

describe('Context', () => {

    let context;

    beforeEach(() => {
        context = new Context;
    });

    describe('createSubContext', () => {

        let options, customContext, subContext, internalScope;

        beforeEach(() => {

            options       = {verbosity: 3};
            internalScope = {base: 'foo'};
            customContext = new Context(options, internalScope);
            subContext    = customContext.createSubContext({ext: 'bar'});
        });

        it('should not have any side-effects on the initial scope', () => {

            internalScope.should.deep.equal({base: 'foo'});
        });

        it('should create a new context with the given scope', () => {

            subContext.scope.should.deep.equal({ext: 'bar'});
        });

        it('should set the parent property accordingly', () => {

            subContext.parentId.should.equal(customContext.id);
        });

        it('should create a new context with a unique ID', () => {

            subContext.id.should.not.equal(customContext.id);
        });
    });

    describe('withScope', () => {

        it('should run some function with a subContext that includes the given scope', () => {

            new Context({}, {base: 'foo'}).withScope({ext: 'bar'}, context => context.scope.ext).should.equal('bar');
        });
    });
});