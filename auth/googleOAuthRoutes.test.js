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
    assert.match(source, /function hashOAuthState\(state\)/);
    assert.match(source, /DELETE FROM chattbm_google_oauth_states WHERE state_hash = \$1 AND expires_at > NOW\(\) RETURNING link_user_id/);
    assert.match(source, /INSERT INTO chattbm_google_oauth_states/);
    assert.doesNotMatch(source, /COOKIE_STATE|COOKIE_LINK/);
});

test('OAuth callback requires a verified email from a verified ID token', () => {
    assert.match(source, /oauthClient\.verifyIdToken\(/);
    assert.match(source, /profile\.email_verified !== true/);
    assert.match(source, /A verified Google email is required\./);
});

test('Google sign-in does not silently link to an existing email account', () => {
    assert.match(source, /SELECT id FROM chattbm_users WHERE email_normalized = \$1/);
    assert.match(source, /status\(409\)\.send\(/);
    assert.match(source, /Sign in to that account, then use the Google link option/);
});

test('new Google accounts and sessions are created in one database transaction', () => {
    assert.match(source, /await db\.query\('BEGIN'\)/);
    assert.match(source, /await db\.query\('COMMIT'\)/);
    assert.match(source, /await db\.query\('ROLLBACK'\)/);
    assert.match(source, /finally \{\s*if \(db\) db\.release\(\);\s*\}/);
});

test('session token is stored as a hash and handed off once without a session cookie', () => {
    assert.match(source, /hashSessionToken\\(token\\)/);
    assert.match(source, /HANDOFF_TTL_MS = 2 \\* 60 \\* 1000/);
    assert.match(source, /INSERT INTO chattbm_google_oauth_handoffs/);
    assert.match(source, /DELETE FROM chattbm_google_oauth_handoffs/);
    assert.ok(source.includes("router.post('/session-handoff'"));
    assert.doesNotMatch(source, /res\\.cookie\\(SESSION_COOKIE/);
});

test('Google account linking requires an existing authenticated ChatTBM session', () => {
    assert.match(source, /router\.post\('\/link'/);
    assert.match(source, /authenticateSession\(token\)/);
    assert.match(source, /Your ChatTBM session expired\. Sign in again before linking Google/);
});

test('Google account linking requires the same verified email and rejects identities owned by another account', () => {
    assert.match(source, /linkMode && \(!signedInUser \|\| signedInUser\.disabled_at \|\| signedInUser\.email !== email\)/);
    assert.match(source, /This Google account is already linked to another ChatTBM account/);
    assert.match(source, /INSERT INTO chattbm_oauth_identities/);
});
