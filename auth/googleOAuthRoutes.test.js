'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
    path.join(__dirname, 'googleOAuthRoutes.js'),
    'utf8'
);

test('Google OAuth is disabled when required configuration is missing', () => {
    assert.match(source, /function configured\(\)/);
    assert.match(source, /process\.env\.GOOGLE_CLIENT_ID/);
    assert.match(source, /process\.env\.GOOGLE_CLIENT_SECRET/);
    assert.match(source, /process\.env\.GOOGLE_REDIRECT_URI/);
    assert.match(source, /status\(503\)\.send\('Google sign-in is not configured yet\.'/);
});

test('OAuth callback validates state before exchanging the authorization code', () => {
    const stateCheck = source.indexOf('Google sign-in state validation failed.');
    const codeExchange = source.indexOf('oauthClient.getToken(req.query.code)');
    assert.notEqual(stateCheck, -1);
    assert.notEqual(codeExchange, -1);
    assert.ok(stateCheck < codeExchange);
    assert.match(source, /timingSafeEqual\(/);
});

test('OAuth callback requires a verified email from a verified ID token', () => {
    assert.match(source, /oauthClient\.verifyIdToken\(/);
    assert.match(source, /profile\.email_verified !== true/);
    assert.match(source, /A verified Google email is required\./);
});

test('Google sign-in does not silently link to an existing email account', () => {
    assert.match(source, /SELECT id FROM chattbm_users WHERE email_normalized = \$1/);
    assert.match(source, /status\(409\)\.send\(/);
    assert.match(source, /Sign in with that account before linking Google/);
});

test('new Google accounts and sessions are created in one database transaction', () => {
    assert.match(source, /await db\.query\('BEGIN'\)/);
    assert.match(source, /await db\.query\('COMMIT'\)/);
    assert.match(source, /await db\.query\('ROLLBACK'\)/);
    assert.match(source, /finally \{\s*if \(db\) db\.release\(\);\s*\}/);
});

test('session token is stored as a hash and cookie is HTTP-only and secure', () => {
    assert.match(source, /hashSessionToken\(token\)/);
    assert.match(source, /httpOnly: true/);
    assert.match(source, /secure: true/);
    assert.match(source, /sameSite: 'none'/);
});
