'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
    path.join(__dirname, 'ChatTBMBrowser.mjs'),
    'utf8'
);

test('login UI exposes the forgot-password action', () => {
    assert.match(source, /this\.authMode === 'login'/);
    assert.match(source, /dataset\.action = 'auth-forgot'/);
    assert.match(source, /Forgot password\?/);
});

test('reset links initialize reset mode from resetToken query parameter', () => {
    assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\('resetToken'\)/);
    assert.match(source, /this\.resetToken \? 'reset' : 'closed'/);
});

test('forgot-password form submits email through the auth API and gives generic confirmation', () => {
    assert.match(source, /requestPasswordReset\(email\)/);
    assert.match(source, /If an account exists for that email, a reset link will be sent\./);
});

test('reset form submits token and new password, then clears token from the URL on success', () => {
    assert.match(source, /resetPassword\(this\.resetToken, password\)/);
    assert.match(source, /this\.authMode = 'login'/);
    assert.match(source, /window\.history\.replaceState\(\{\}, '', window\.location\.pathname\)/);
});
