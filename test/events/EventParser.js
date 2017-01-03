'use strict';

const sinon = require('sinon');

const EventParser   = require('./../../lib/events/EventParser');
const ParserContext = require('./../../lib/events/ParseContext');

require('./../support/index');

describe('EventParser', () => {

    let parser, beginSpy;

    let beginObj = {
        "context":   "1337",
        "timestamp": 12345,
        "begin":     {"parent": null, "scope": {}}
    };

    let customObj = {
        "context":   "1337",
        "timestamp": 12346,
        "something": "happened"
    };

    beforeEach(() => {

        parser   = new EventParser();
        beginSpy = sinon.spy();

        parser.on('begin', beginSpy);
    });

    describe('context parsing', () => {

        it('should parse contexts when the "begin" event is fired', () => {

            parser.receive(beginObj);

            beginSpy.should.have.been.calledOnce;
            beginSpy.should.have.been.calledWithMatch(sinon.match.instanceOf(ParserContext));
        });

        it('should expose contexts via the getContext method', () => {

            parser.receive(beginObj);
            parser.getContext("1337").should.be.an.instanceOf(ParserContext);
        });
    });

    describe('.use', () => {

        it('should allow to attach reducers', () => {

            let reducer = sinon.spy();
            parser.use(data => reducer(data.get('something')));

            parser.receive(customObj);

            reducer.should.have.been.calledOnce;
            reducer.should.have.been.calledWith('happened');
        });

        it('should not call the second reducer when the first one returned null', () => {

            let reducer = sinon.spy();
            parser.use(data => null);
            parser.use(reducer);

            parser.receive(beginObj);
            parser.receive(customObj);

            reducer.should.not.have.been.called;
        });
    });

    describe('.useCombine', () => {

        it('should allow to attach handlers for specific properties inside the event object', () => {

            let reducer = sinon.spy();
            parser.useCombine({
                something: reducer
            });

            parser.receive(beginObj);
            parser.receive(customObj);

            reducer.should.have.been.calledWith('happened');
        });
    });

    describe('strict mode (.setStrict())', () => {

        it('should throw an error if an event object goes unreduced', () => {

            parser.setStrict();

            (() => parser.receive(customObj)).should.throw();
        });

        it('should not throw an error if an attached handler reduces the event object', () => {

            parser.setStrict();
            parser.use(data => null);

            parser.receive(beginObj);
            (() => parser.receive(customObj)).should.not.throw();
        });
    });
});
