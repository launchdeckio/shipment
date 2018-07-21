import streamBuffers from 'stream-buffers';
import test from 'ava';

import {cli} from '../';
import actions from './fixtures/actions';

const capture = async (actions, options, args) => {

    const buffer = new streamBuffers.WritableStreamBuffer();

    const c = cli(actions, {
        ...options,
        outputStream: buffer,
    });

    await c.exec(args);

    const contents = buffer.getContentsAsString('utf8');

    return contents === false ? '' : contents;
};

const fooEventFormatter = ({verbose}) => evt => {
    if (evt.fooEvent) return verbose ? 'the fooEvent has been fired!' : 'fooEvent fired';
};

test('cli should output the result of the action', async t => {
    const result = await capture(actions, {}, 'toUpper --message=hi');
    t.regex(result, /HI/);
});

test('cli should output events of type "info"', async t => {
    const result = await capture(actions, {}, 'dispatchInfo');
    t.regex(result, /interesting information/);
});

test('cli should not print "custom events" without the proper formatter', async t => {
    const result = await capture(actions, {}, 'customEvent');
    t.notRegex(result, /fooEvent/);
});

test('cli should allow custom "formatters"', async t => {

    const result = await capture(actions, {formatters: [fooEventFormatter]}, 'customEvent');
    t.regex(result, /fooEvent fired/);

    const resultVerbose = await capture(actions, {formatters: [fooEventFormatter]}, 'customEvent -v');
    t.regex(resultVerbose, /the fooEvent has been fired!/);
});

test('cli formatter overriding', async t => {
    const customFormatter = () => evt => {
        if (evt.result) return 'A result has arrived!';
    };
    const result          = await capture(actions, {formatters: [customFormatter]}, 'toUpper --message=hi');
    t.regex(result, /A result has arrived/);
    t.notRegex(result, /HI/);
});

test('raw mode', async t => {
    const result = await capture(actions, {}, 'customEvent --raw');
    t.regex(result, /fooEvent/);

    const result1 = await capture(actions, {formatters: [fooEventFormatter]}, 'customEvent --raw');
    t.notRegex(result1, /fooEvent fired/);
});

// test "raw"