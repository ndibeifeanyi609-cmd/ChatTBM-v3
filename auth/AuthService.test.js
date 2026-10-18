'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const postgres = require('../database/Postgres');
const state = { users: [], sessions: [] };
const fakePool = {
 async query(sql, v = []) {
  if (sql.startsWith('INSERT INTO chattbm_users')) {
   if (state.users.some(u => u.email_normalized === v[1])) { const e = new Error('duplicate'); e.code = '23505'; throw e; }
   const u = { id: v[0], email_normalized: v[1], password_hash: v[2], created_at: new Date().toISOString(), disabled_at: null };
   state.users.push(u);
   return { rows: [{ id: u.id, email_normalized: u.email_normalized, created_at: u.created_at }], rowCount: 1 };
  }
  if (sql.startsWith('SELECT id, email_normalized, password_hash, disabled_at FROM chattbm_users')) {
   const u = state.users.find(x => x.email_normalized === v[0]);
   return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
  }
  if (sql.startsWith('INSERT INTO chattbm_auth_sessions')) {
   state.sessions.push({ id: v[0], user_id: v[1], token_hash: v[2], expires_at: new Date(v[3]), revoked_at: null });
   return { rows: [], rowCount: 1 };
  }
  if (sql.includes('FROM chattbm_auth_sessions s JOIN chattbm_users u')) {
   const s = state.sessions.find(x => x.token_hash === v[0] && !x.revoked_at && x.expires_at > new Date());
   const u = s && state.users.find(x => x.id === s.user_id && !x.disabled_at);
   return { rows: u ? [{ id: u.id, email_normalized: u.email_normalized }] : [], rowCount: u ? 1 : 0 };
  }
  if (sql.startsWith('UPDATE chattbm_auth_sessions')) {
   const s = state.sessions.find(x => x.token_hash === v[0] && !x.revoked_at);
   if (s) s.revoked_at = new Date();
   return { rows: s ? [{ id: s.id }] : [], rowCount: s ? 1 : 0 };
  }
  throw new Error('Unexpected SQL in test: ' + sql);
 }
};
postgres.getPool = () => fakePool;
const { register, login, authenticateSession, revokeSession } = require('./AuthService');
const { hashSessionToken } = require('./AuthCrypto');
test.beforeEach(() => { state.users.length = 0; state.sessions.length = 0; });
test('rejects malformed email and weak passwords before database access', async () => {
 const a = await register('not-an-email', 'a-long-enough-password');
 const b = await register('person@example.com', 'short');
 assert.equal(a.code, 'INVALID_REGISTRATION');
 assert.equal(b.code, 'INVALID_REGISTRATION');
});
test('normalizes email and stores only a password hash', async () => {
 const r = await register(' Person@Example.com ', 'correct-horse-battery-7');
 assert.equal(r.success, true);
 assert.equal(r.user.email_normalized, 'person@example.com');
 assert.equal(Object.hasOwn(r.user, 'password_hash'), false);
 assert.match(state.users[0].password_hash, /^scrypt\$/);
});
test('returns generic login failures for unknown email and wrong password', async () => {
 const unknown = await login('missing@example.com', 'correct-horse-battery-7');
 await register('person@example.com', 'correct-horse-battery-7');
 const wrong = await login('person@example.com', 'wrong-password-value');
 assert.deepEqual(unknown, wrong);
 assert.equal(wrong.code, 'INVALID_CREDENTIALS');
});
test('creates, authenticates, and revokes a session', async () => {
 await register('person@example.com', 'correct-horse-battery-7');
 const r = await login('person@example.com', 'correct-horse-battery-7');
 assert.equal(r.success, true);
 assert.equal((await authenticateSession(r.token)).id, r.user.id);
 assert.equal(await revokeSession(r.token), true);
 assert.equal(await authenticateSession(r.token), null);
 assert.equal(await revokeSession(r.token), false);
});
test('rejects expired sessions', async () => {
 await register('person@example.com', 'correct-horse-battery-7');
 const r = await login('person@example.com', 'correct-horse-battery-7');
 state.sessions.find(s => s.token_hash === hashSessionToken(r.token)).expires_at = new Date(Date.now() - 1000);
 assert.equal(await authenticateSession(r.token), null);
});
