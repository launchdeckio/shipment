import test from 'ava';
import sinon from 'sinon';

import Context from '../lib/Context';

test('emits the "begin" event when instantiated', t => {

    const receive = sinon.spy();

    new Context({
        receive,
        scope: {foo: 9000},
    });

    const evt = receive.args[0][0];

    t.truthy(evt);

    t.deepEqual(evt.begin, {scope: {foo: 9000}});
});

test('.branch ID assignment', t => {

    const a  = new Context({});
    const b1 = a.branch();
    const b2 = a.branch();
    const c  = b2.branch();
    t.is(b1.id, '0.0');
    t.is(b2.id, '0.1');
    t.is(c.id, '0.1.0');
});

test('.branch option inheriting', t => {

    const a = new Context({
        args: {foo: 9000},
    });

    const b = a.branch();

    t.deepEqual(b.args, {foo: 9000});
});

test('.branch wrapReceive', t => {

    const aReceive = sinon.spy();
    const bReceive = sinon.spy();

    const a = new Context({receive: aReceive});

    const b = a.branch({}, receive => event => {
        bReceive(event);
        receive(event);
    });

    t.is(aReceive.callCount, 2);
    t.is(bReceive.callCount, 1);
});