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

test('does not restore an existing signed-in session while a reset token is active', async () => {
    const { shouldRestoreSignedInSession } = await import('./resetUrl.mjs');
    assert.equal(shouldRestoreSignedInSession({ id: 'user-1' }, 'one-time-secret'), false);
});

test('restores an existing signed-in session when no reset token is active', async () => {
    const { shouldRestoreSignedInSession } = await import('./resetUrl.mjs');
    assert.equal(shouldRestoreSignedInSession({ id: 'user-1' }, ''), true);
});
