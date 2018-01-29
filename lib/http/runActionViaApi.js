const through     = require('through2');
const LineWrapper = require('stream-line-wrapper');

const withServerLifecycle = require('./withServerLifecycle');

module.exports = async ({output = false, prefix = ':'}, action, {args, verifyKey}, stream) => {
    try {
        const out = through();
        const err = through();

        out.pipe(stream);
        err.pipe(stream);

        if (output) {
            out.pipe(new LineWrapper({prefix})).pipe(process.stdout);
            err.pipe(new LineWrapper({prefix})).pipe(process.stderr);
        }

        const receive = evt => stream.write(JSON.stringify(evt));

        await withServerLifecycle(verifyKey, action.name, out, err, async () => {
            const context = action.makeContext(args, receive);
            return await action.execute(context, args);
        });

    } finally {

        // Close the response, signaling the client that all data has arrived
        await new Promise(resolve => stream.end(resolve));
    }
};