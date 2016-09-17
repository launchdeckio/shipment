'use strict';

require('./support/index');

const sinon = require('sinon');
const _     = require('lodash');

const Option = require('./../lib/Option');

describe('Option', () => {

    let mockOption;

    beforeEach(() => {
        mockOption = new Option('mockOption', yargs => {
            yargs.transform();
            return yargs;
        }, (options, argv) => options.transform(argv));
    });

    describe('transformYargs', () => {

        it('should invoke the first constructor argument', () => {

            let yargs = {transform: sinon.spy()};
            mockOption.transformYargs(yargs).should.equal(yargs);
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

    describe('createSimpleFlag', () => {

        it('should instantiate a flag-like option', () => {

            let option = Option.createSimpleFlag('foobarness', 'The degree of foobarness', 'f', true);
            let yargs  = option.transformYargs(require('yargs'));
            yargs.parse(['--foobarness']).should.have.property('foobarness', 1);
            yargs.parse(['-fff']).should.have.property('foobarness', 3);
            let options = {};
            option.transformContextOptions(options, {foobarness: 10});
            options.should.deep.equal({foobarness: 10});
        });
    });
});