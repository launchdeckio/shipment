'use strict';

const through     = require('through2');
const LineWrapper = require('stream-line-wrapper');

const withServerLifecycle = require('./withServerLifecycle');

module.exports = async ({output}, action, {args, verifyKey}, response) => {
    try {
        const out = through();
        const err = through();

        out.pipe(response);
        err.pipe(response);

        if (output) {
            out.pipe(new LineWrapper({prefix: '> '})).pipe(process.stdout);
            err.pipe(new LineWrapper({prefix: '> '})).pipe(process.stderr);
        }

        await withServerLifecycle(verifyKey, action.getName(), out, err, async () => {
            const context = action.makeContext(args, false, null, {outputStream: out});
            return await action.execute(context, args);
        });
    } finally {
        // Close the response, signaling the client that all data has arrived
        await new Promise(resolve => response.end(resolve));
    }
};