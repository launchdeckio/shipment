const through     = require('through2');
const LineWrapper = require('stream-line-wrapper');

const withServerLifecycle = require('./withServerLifecycle');

module.exports = async ({output = false, prefix = ''}, action, args, stream) => {
    try {
        const out = through();
        const err = through();

        out.pipe(stream);
        err.pipe(stream);

        if (output) {
            out.pipe(new LineWrapper({prefix})).pipe(process.stdout);
            err.pipe(new LineWrapper({prefix})).pipe(process.stderr);
        }

        const receive = evt => out.write(JSON.stringify(evt) + '\n');

        await withServerLifecycle(action.name, out, err, async () => {
            return await action.execute(args, receive);
        });

    } finally {

        // Close the response, signaling the client that all data has arrived
        await new Promise(resolve => stream.end(resolve));
    }
};