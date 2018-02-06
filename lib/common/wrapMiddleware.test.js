import test from 'ava';

import wrapMiddleware from './wrapMiddleware';

const middleware = [

    (next, evt, line) => next(evt, evt.begin ? 'BEGIN!' : line),
    (next, evt, line) => next(evt, evt.end ? 'END!' : line),
    (next, evt, line) => next(evt, evt.silly ? 'SILLY!' : line),

    (next, evt, line) => {
        // Test "overrides"
        const output = next(evt, line);
        if (output === 'SILLY!') return 'please no silly...';
        return output;
    },
];

test('wrapMiddleware', t => {

    const fn = wrapMiddleware((evt, line = null) => line, middleware);

    t.is(fn({begin: true}), 'BEGIN!');

    t.is(fn({end: true}), 'END!');

    t.is(fn({}), null);

    t.is(fn({silly: true}), 'please no silly...');
});