import test from 'ava';
import request from 'supertest';

import {http} from '..';

import actions from './fixtures/actions';

test('http', async t => {

    const {app} = http(actions);

    await request(app)
        .post('/toUpper')
        .send({message: 'hi'})
        .expect(/SHIPMENT: start/)
        .expect(/HI/)
        .expect(/SHIPMENT: ok/);

    await request(app)
        .get('/customEvent')
        .expect(/fooEvent/);

    await request(app)
        .post('/nonExistent')
        .expect(404);

    t.pass();

});