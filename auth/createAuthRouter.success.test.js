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
    emailVerification: { createEmailVerification: async () => null, redeemEmailVerification: async () => ({ success: false }) },
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
  assert.deepEqual(res.body, { success: true, user: { id: 'u1', email: 'user@example.com' }, message: 'Account created. Sign in to start a session.' });
});
