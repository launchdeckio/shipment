'use strict';

require('./../support');

const ri = require('./../../lib/util/readableInterval');

describe('readableInterval', () => {

    it('should format the given amount of milliseconds into a more human-readable format', () => {

        ri(1000).should.equal('1 s');
        ri(2000).should.equal('2 s');
        ri(200).should.equal('200 ms');
        ri(875).should.equal('875 ms');
        ri(1200).should.equal('1.2 s');
        ri(1750).should.equal('1.75 s');
        ri(2890).should.equal('2.9 s');
        ri(34120).should.equal('34.1 s');
        ri(72451).should.equal('0:01:12');
    });
});