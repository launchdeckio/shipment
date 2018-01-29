import test from 'ava';
import request from 'supertest';

import {http} from '..';

import actions from './fixtures/actions';

test('http', async t => {

    const {app} = http(actions);

    await request(app)
        .post('/customEvent')
        .send({message: 'hi'})
        .expect(/SHIPMENT: start: customEvent/)
        .expect(/fooEvent/)
        .expect(/SHIPMENT: ok/);

    t.pass();
});