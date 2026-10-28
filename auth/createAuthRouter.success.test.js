'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthRouter } = require('./createAuthRouter');

test('successful registration keeps the established 201 response shape', async () => {
  const routes = new Map();
  const express = { Router: () => ({ post: (path, ...handlers) => routes.set(path, handlers), get() {} }) };
  const allow = (_req, _res, next) => next();
  createAuthRouter({
    express,
    services: {
      register: async () => ({ success: true, user: { id: 'u1', email_normalized: 'user@example.com' } }),
      login: async () => ({ success: false }),
      authenticateSession: async () => null,
      revokeSession: async () => {}
    },
    passwordReset: { createPasswordReset: async () => null, redeemPasswordReset: async () => ({ success: false }) },
    emailVerification: { createEmailVerification: async email => ({ email, token: 'test-verification-token' }), redeemEmailVerification: async () => ({ success: false }) },
    sendPasswordResetEmail: async () => {},
    sendEmailVerificationEmail: async () => {},
    limiters: {
      registration: allow, login: allow, passwordResetRequest: allow, passwordResetRedeem: allow,
      emailVerificationRequest: allow, emailVerificationRedeem: allow
    },
    nodeEnv: 'test'
  });
  const handlers = routes.get('/register');
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
  let i = 0;
  const next = () => { i += 1; };
  await handlers[0]({}, res, next);
  await handlers[i]({ body: { email: 'user@example.com', password: 'secret' } }, res, next);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { success: true, user: { id: 'u1', email: 'user@example.com' }, message: 'Account created. Check your email for a verification link before signing in.' });
});


test('verification resend endpoint returns an anti-enumeration response and sends only when a token is issued', async () => {
  const routes = new Map();
  const express = { Router: () => ({ post: (path, ...handlers) => routes.set(path, handlers), get() {} }) };
  const allow = (_req, _res, next) => next();
  const sent = [];
  createAuthRouter({
    express,
    services: {
      register: async () => ({ success: false }),
      login: async () => ({ success: false }),
      authenticateSession: async () => null,
      revokeSession: async () => {}
    },
    passwordReset: { createPasswordReset: async () => null, redeemPasswordReset: async () => ({ success: false }) },
    emailVerification: {
      createEmailVerification: async email => email === 'verified@example.com' ? null : { email, token: 'one-time-test-token' },
      redeemEmailVerification: async () => ({ success: false })
    },
    sendPasswordResetEmail: async () => {},
    sendEmailVerificationEmail: async value => { sent.push(value.email); },
    limiters: {
      registration: allow, login: allow, passwordResetRequest: allow, passwordResetRedeem: allow,
      emailVerificationRequest: allow, emailVerificationRedeem: allow
    },
    nodeEnv: 'test'
  });
  const handlers = routes.get('/email-verification/request');
  async function request(email) {
    const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
    let i = 0;
    const next = () => { i += 1; };
    await handlers[0]({ body: { email } }, res, next);
    await handlers[i]({ body: { email } }, res, next);
    return res;
  }
  const unknown = await request('new@example.com');
  const verified = await request('verified@example.com');
  assert.equal(unknown.statusCode, 200);
  assert.deepEqual(unknown.body, verified.body);
  assert.equal(unknown.body.success, true);
  assert.deepEqual(sent, ['new@example.com']);
});


test('registration remains created but does not claim delivery when verification email fails', async () => {
  const routes = new Map();
  const express = { Router: () => ({ post: (path, ...handlers) => routes.set(path, handlers), get() {} }) };
  const allow = (_req, _res, next) => next();
  createAuthRouter({
    express,
    services: {
      register: async () => ({ success: true, user: { id: 'u2', email_normalized: 'user2@example.com' } }),
      login: async () => ({ success: false }),
      authenticateSession: async () => null,
      revokeSession: async () => {}
    },
    passwordReset: { createPasswordReset: async () => null, redeemPasswordReset: async () => ({ success: false }) },
    emailVerification: { createEmailVerification: async () => ({ email: 'user2@example.com', token: 'test-token' }), redeemEmailVerification: async () => ({ success: false }) },
    sendPasswordResetEmail: async () => {},
    sendEmailVerificationEmail: async () => { throw Object.assign(new Error('offline'), { code: 'MAIL_OFFLINE' }); },
    limiters: {
      registration: allow, login: allow, passwordResetRequest: allow, passwordResetRedeem: allow,
      emailVerificationRequest: allow, emailVerificationRedeem: allow
    },
    nodeEnv: 'test'
  });
  const handlers = routes.get('/register');
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
  let i = 0;
  const next = () => { i += 1; };
  const oldError = console.error;
  console.error = () => {};
  try {
    await handlers[0]({}, res, next);
    await handlers[i]({ body: { email: 'user2@example.com', password: 'secret' } }, res, next);
  } finally {
    console.error = oldError;
  }
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.match(res.body.message, /could not be sent/i);
  assert.doesNotMatch(res.body.message, /check your email/i);
});
