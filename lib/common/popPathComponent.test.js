import test from 'ava';
import popPathComponent from './popPathComponent';

test('popPathComponent', t => {
    t.is(popPathComponent('0.1.2'), '0.1');
    t.is(popPathComponent('0'), '');
    t.is(popPathComponent(null), null);
});