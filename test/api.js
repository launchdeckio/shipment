import test from 'ava';
import sinon from 'sinon';

import {api} from '..';

import actions from './fixtures/actions';

test('ApiWrapper', async t => {

    const a = api(actions);

    t.is(await a.toUpper({message: 'hi'}), 'HI');
});

test('receive events', async t => {

    const a = api(actions);

    const receive = sinon.spy();

    await a.customEvent({}, receive);

    t.true(receive.calledWith(sinon.match({fooEvent: 'foobar'})));
});