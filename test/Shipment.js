import test from 'ava';

import {Shipment} from '..';

import Action from '../lib/Action';

const actions = {
    someAction() {
        return 'hi!';
    },
};

test('converts given functions to Action instances', t => {
    const shipment = new Shipment(actions);
    t.true(shipment.actions.someAction instanceof Action);
    t.is(shipment.actions.someAction.name, 'someAction');
});

test('constructor prevents wrapper one instance inside of another', t => {
    const a = new Shipment(actions);
    const b = new Shipment(a);
    t.true(b.actions.someAction instanceof Action);
});