import streamBuffers from 'stream-buffers';
import test from 'ava';

import {cli} from '..';
import actions from './fixtures/actions';

test('cli should output the result of the action', async t => {

    const buffer = new streamBuffers.WritableStreamBuffer();

    const c = cli(actions, {
        outputStream: buffer,
    });

    await c.exec('toUpper --message=hi');

    const result = buffer.getContentsAsString('utf8');

    t.regex(result, /HI/);
});