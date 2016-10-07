'use strict';

module.exports = reader => {

    process.stdin.resume();
    process.stdin.pipe(reader);
};