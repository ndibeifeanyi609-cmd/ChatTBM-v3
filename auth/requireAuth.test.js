'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const authService = require('./AuthService');

function loadWithAuth(authenticateSession) {
  const original = authService.authenticateSession;
  authService.authenticateSession = authenticateSession;
  delete require.cache[require.resolve('./requireAuth')];
  const middleware = require('./requireAuth').requireAuth;
  authService.authenticateSession = original;
  return middleware;
}
function resMock() {
  return { statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
}
function reqMock(token) {
  return { cookies: token ? { chattbm_session: token } : {},
    get(name) { return name.toLowerCase() === 'authorization' ? '' : ''; } };
}

test('accepts only the identity returned by session verification', async () => {
  const middleware = loadWithAuth(async token => {
    assert.equal(token, 'valid-session-token');
    return { id: 'verified-user', email: 'user@example.com' };
  });
  const req = reqMock('valid-session-token');
  const res = resMock();
  let nextCalled = false;
  await middleware(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.authUser.id, 'verified-user');
});

test('rejects missing or invalid sessions', async () => {
  const middleware = loadWithAuth(async () => null);
  for (const req of [reqMock(), reqMock('invalid-token')]) {
    const res = resMock();
    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'AUTHENTICATION_REQUIRED');
  }
});

test('returns a controlled 503 when the auth database is unavailable', async () => {
  const middleware = loadWithAuth(async () => {
    const error = new Error('private database details');
    error.code = 'AUTH_DATABASE_UNAVAILABLE';
    throw error;
  });
  const res = resMock();
  let nextCalled = false;
  await middleware(reqMock('valid-session-token'), res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error.code, 'AUTH_UNAVAILABLE');
  assert.equal(JSON.stringify(res.body).includes('private database details'), false);
});

test('reads bearer tokens when the session cookie is absent', () => {
  const { readSessionToken } = require('./requireAuth');
  const req = {
    cookies: {},
    get(name) {
      return name.toLowerCase() === 'authorization'
        ? 'Bearer bearer-session-token'
        : '';
    }
  };
  assert.equal(readSessionToken(req), 'bearer-session-token');
});

test('prefers the session cookie over an authorization header', () => {
  const { readSessionToken } = require('./requireAuth');
  const req = {
    cookies: { chattbm_session: 'cookie-session-token' },
    get() { return 'Bearer other-session-token'; }
  };
  assert.equal(readSessionToken(req), 'cookie-session-token');
});

test('rejects an empty bearer token', () => {
  const { readSessionToken } = require('./requireAuth');
  const req = { cookies: {}, get() { return 'Bearer   '; } };
  assert.equal(readSessionToken(req), null);
});
