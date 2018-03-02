const through     = require('through2');
const LineWrapper = require('stream-line-wrapper');

const Parser              = require('../parse/Parser');
const withServerLifecycle = require('./withServerLifecycle');
const stringifyResult     = require('../common/stringifyResult');

const rawReceiver    = out => evt => out.write(JSON.stringify(evt) + '\n');
const resultReceiver = out => Parser.wrap((evt) => {
    // TODO check if it's the "top-level" context based on
    // second argument (ParseContext)
    if (evt.result) out.write(stringifyResult(evt.result.data));
});

/**
 * @param {Boolean} [output = false] Pipe output from the action through to this process' output?
 * @param {String} [prefix = ''] String prefix for piped output
 * @param {Action} action
 * @param {Object} args
 * @param {Stream} stream Output stream (generally the HTTP response object)
 * @param {Boolean} [primitive = false] Output only the action result instead of the full log?
 * @returns {Promise<void>}
 */
module.exports = async ({output = false, prefix = ''}, action, args, stream, primitive = false) => {
    try {
        const out = through();
        const err = through();

        out.pipe(stream);
        err.pipe(stream);

        if (output) {
            out.pipe(new LineWrapper({prefix})).pipe(process.stdout);
            err.pipe(new LineWrapper({prefix})).pipe(process.stderr);
        }

        const receive = primitive ? resultReceiver(out) : rawReceiver(out);

        await withServerLifecycle(action.name, out, err, async () => {
            return await action.execute(args, receive);
        });

    } finally {

        // Close the response, signaling the client that all data has arrived
        await new Promise(resolve => stream.end(resolve));
    }
};