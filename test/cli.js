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

test('cli should output the result of the action', async t => {
    const result = await capture(actions, {}, 'toUpper --message=hi');
    t.regex(result, /HI/);
});

test('cli should not print "custom events" without the proper formatter', async t => {
    const result = await capture(actions, {}, 'customEvent');
    t.notRegex(result, /fooEvent/);
});

test('cli should allow custom "formatters"', async t => {

    const customFormatter = ({verbose}) => evt => {
        if (evt.fooEvent) return verbose ? 'the fooEvent has been fired!' : 'fooEvent fired';
    };

    const result = await capture(actions, {formatters: [customFormatter]}, 'customEvent');
    t.regex(result, /fooEvent fired/);

    const resultVerbose = await capture(actions, {formatters: [customFormatter]}, 'customEvent -v');
    t.regex(resultVerbose, /the fooEvent has been fired!/);
});