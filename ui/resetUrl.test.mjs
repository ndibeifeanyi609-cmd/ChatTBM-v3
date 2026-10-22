import test from 'node:test';
import assert from 'node:assert/strict';
import { captureAndClearResetToken } from './resetUrl.mjs';

test('clears reset token while preserving other query parameters and fragment', () => {
    let replaced = null;
    const token = captureAndClearResetToken(
        'https://chattbm.com/?token=one-time-secret&campaign=welcome#signin',
        (...args) => { replaced = args; }
    );
    assert.equal(token, 'one-time-secret');
    assert.deepEqual(replaced, [{}, '', '/?campaign=welcome#signin']);
});

test('does not alter URL when no reset token is present', () => {
    let called = false;
    const token = captureAndClearResetToken(
        'https://chattbm.com/?campaign=welcome#signin',
        () => { called = true; }
    );
    assert.equal(token, '');
    assert.equal(called, false);
});
