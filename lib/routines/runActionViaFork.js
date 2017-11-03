'use strict';

const child_process = require('child_process');
const LineWrapper   = require('stream-line-wrapper');

module.exports = ({workerPath, exportPath, output}, action, {args, verifyKey}, stream) => {

    const fork = child_process.fork(workerPath, {silent: true});

    fork.stdout.pipe(stream);
    fork.stderr.pipe(stream);

    if (output) {
        fork.stdout.pipe(new LineWrapper({prefix: '> '})).pipe(process.stdout);
        fork.stderr.pipe(new LineWrapper({prefix: '> '})).pipe(process.stderr);
    }

    fork.send({
        action: action.getName(),
        exportPath,
        args,
        verifyKey,
    });
};