import test from 'ava';

import {api} from '..';

import actions from './fixtures/actions';

test('ApiWrapper', async t => {

    const a = api(actions);

    t.is(await a.toUpper({message: 'hi'}), 'HI');
});