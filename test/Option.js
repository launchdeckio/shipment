'use strict';

require('./support/support');

const sinon = require('sinon');

const Option = require('./../lib/Option');

describe('Option', () => {

    let mockOption;

    beforeEach(() => {
        mockOption = new Option(yargs => yargs.transform(), (options, argv) => options.transform(argv));
    });

    describe('transformYargs', () => {

        it('should invoke the first constructor argument', () => {

            let yargs = {transform: sinon.spy()};
            mockOption.transformYargs(yargs);
            yargs.transform.should.have.been.calledOnce;
        });
    });

    describe('transformContextOptions', () => {

        it('should invoke the second constructor argument', () => {

            let argv    = {foo: 'barss'};
            let options = {transform: sinon.spy()};
            mockOption.transformContextOptions(options, argv);
            options.transform.should.have.been.calledWith(argv);
        });
    });
});