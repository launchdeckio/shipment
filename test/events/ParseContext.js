'use strict';

require('./../support');

const ParseContext = require('./../../lib/events/ParseContext');

describe('ParseContext', () => {

    let parseContext;

    beforeEach(() => {

        parseContext = new ParseContext(1000);
    });

    describe('constructor', () => {

        it('should throw an error if no ID if provided', () => {

            (() => new ParseContext()).should.throw();
        });
    });

    describe('within', () => {

        it('should determine whether the given ID is within the parent chain of the context', () => {

            let parent1 = new ParseContext(1);
            let parent2 = new ParseContext(2);
            let parent3 = new ParseContext(3);

            parent2.parent = parent1;

            parseContext.parent = parent2;
            parseContext.within(parent1).should.be.true;
            parseContext.within(1).should.be.true;

            parseContext.parent = parent3;
            parseContext.within(parent1).should.be.false;
            parseContext.within(1).should.be.false;
        });
    })
});