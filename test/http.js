import test from 'ava';
import request from 'supertest';

import {http} from '..';

import actions from '../test-fixtures/actions';

test('http', async t => {

    const {app} = http(actions);

    await request(app)
        .post('/toUpper')
        .send({message: 'hi'})
        .expect(/HI/);

    await request(app)
        .get('/customEvent')
        .expect(/fooEvent/);

    await request(app)
        .get('/error')
        .expect(/SHIPMENT: error/);

    await request(app)
        .post('/nonExistent')
        .expect(404);

    t.pass();

});
