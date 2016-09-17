'use strict';

require('./support/index');

const GracefulError = require('./../lib/GracefulError');

describe('GracefulError', () => {

    it('should be a subclass of error', () => {

        (new GracefulError()).should.be.an.instanceof(Error);
    });
});