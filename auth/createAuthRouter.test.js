'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthRouter } = require('./createAuthRouter');
const { createSharedRateLimiter } = require('./sharedRateLimit');

function makeHarness() {
    const routes = new Map();
    const router = {
        post(path, ...handlers) { routes.set('POST ' + path, handlers); },
        get(path, ...handlers) { routes.set('GET ' + path, handlers); }
    };
    const express = { Router: () => router };
    const calls = { register: 0, login: 0, resetRequest: 0, resetConfirm: 0, verifyRequest: 0, verifyConfirm: 0 };
    const services = {
        async register() { calls.register++; return { success: false, error: 'unused', code: 'INVALID_REGISTRATION' }; },
        async login() { calls.login++; return { success: false, error: 'unused' }; },
        async authenticateSession() { return null; },
        async revokeSession() {}
    };
    const emailVerification = {
        async createEmailVerification() { calls.verifyRequest++; return null; },
        async redeemEmailVerification() { calls.verifyConfirm++; return { success: false }; }
    };
    const passwordReset = {
        async createPasswordReset() { calls.resetRequest++; return null; },
        async redeemPasswordReset() { calls.resetConfirm++; return { success: false }; }
    };
    const failClosed = () => createSharedRateLimiter({ store: { async consume() { throw new Error('database offline'); } } });
    const routerInstance = createAuthRouter({
        express, services, passwordReset, emailVerification, sendPasswordResetEmail: async () => {}, sendEmailVerificationEmail: async () => {},
        limiters: { registration: failClosed(), login: failClosed(), passwordResetRequest: failClosed(), passwordResetRedeem: failClosed(), emailVerificationRequest: failClosed(), emailVerificationRedeem: failClosed() },
        nodeEnv: 'test'
    });
    return { routes, calls, routerInstance };
}

function response() {
    return { headers: {}, statusCode: 200, set(k, v) { this.headers[k] = v; return this; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, cookie() {}, clearCookie() {} };
}

async function runRoute(handlers) {
    const req = { ip: '198.51.100.2', body: {}, get() { return ''; } };
    const res = response();
    let nextError;
    let index = 0;
    const next = error => { if (error) nextError = error; index++; };
    await handlers[0](req, res, next);
    if (index && handlers[index]) await handlers[index](req, res, next);
    return { res, nextError };
}

test('all four sensitive auth routes fail closed when shared storage is unavailable', async () => {
    const { routes, calls } = makeHarness();
    const cases = [
        ['POST /register', 'register'],
        ['POST /login', 'login'],
        ['POST /password-reset/request', 'resetRequest'],
        ['POST /password-reset/confirm', 'resetConfirm'],
        ['POST /email-verification/request', 'verifyRequest'],
        ['POST /email-verification/confirm', 'verifyConfirm']
    ];
    for (const [route, service] of cases) {
        const { res, nextError } = await runRoute(routes.get(route));
        assert.equal(nextError, undefined);
        assert.equal(res.statusCode, 503, route);
        assert.equal(res.body.error.code, 'RATE_LIMIT_STORAGE_UNAVAILABLE', route);
    }
    assert.deepEqual(calls, { register: 0, login: 0, resetRequest: 0, resetConfirm: 0, verifyRequest: 0, verifyConfirm: 0 });
});

test('routes use distinct injected limiter functions in the intended order', () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const express = { Router: () => router };
    const noop = () => {};
    const limiters = { registration: function registerLimit(){}, login: function loginLimit(){}, passwordResetRequest: function resetRequestLimit(){}, passwordResetRedeem: function resetConfirmLimit(){}, emailVerificationRequest: function verifyRequestLimit(){}, emailVerificationRedeem: function verifyConfirmLimit(){} };
    createAuthRouter({
        express,
        services: { register: async()=>({success:false}), login: async()=>({success:false}), authenticateSession: async()=>null, revokeSession: async()=>{} },
        passwordReset: { createPasswordReset: async()=>null, redeemPasswordReset: async()=>({success:false}) },
        emailVerification: { createEmailVerification: async()=>null, redeemEmailVerification: async()=>({success:false}) },
        sendPasswordResetEmail: async()=>{}, sendEmailVerificationEmail: async()=>{},
        limiters
    });
    assert.equal(routes.get('POST /register')[0], limiters.registration);
    assert.equal(routes.get('POST /login')[0], limiters.login);
    assert.equal(routes.get('POST /password-reset/request')[0], limiters.passwordResetRequest);
    assert.equal(routes.get('POST /password-reset/confirm')[0], limiters.passwordResetRedeem);
    assert.equal(routes.get('POST /email-verification/request')[0], limiters.emailVerificationRequest);
    assert.equal(routes.get('POST /email-verification/confirm')[0], limiters.emailVerificationRedeem);
    assert.equal(routes.get('GET /me').length, 1);
    assert.equal(routes.get('POST /logout').length, 1);
});

test('allowed requests reach their intended authentication handlers', async () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const express = { Router: () => router };
    const calls = { register: 0, login: 0, resetRequest: 0, resetConfirm: 0, verifyRequest: 0, verifyConfirm: 0 };
    const allow = () => createSharedRateLimiter({ store: { async consume() { return { count: 1, startedAt: Date.now() }; } } });
    createAuthRouter({
        express,
        services: {
            async register() { calls.register++; return { success: false, error: 'invalid', code: 'INVALID_REGISTRATION' }; },
            async login() { calls.login++; return { success: false, error: 'invalid' }; },
            async authenticateSession() { return null; },
            async revokeSession() {}
        },
        passwordReset: {
            async createPasswordReset() { calls.resetRequest++; return null; },
            async redeemPasswordReset() { calls.resetConfirm++; return { success: false }; }
        },
        emailVerification: { async createEmailVerification(){ calls.verifyRequest++; return null; }, async redeemEmailVerification(){ calls.verifyConfirm++; return { success:false }; } },
        sendPasswordResetEmail: async()=>{}, sendEmailVerificationEmail: async()=>{},
        limiters: { registration: allow(), login: allow(), passwordResetRequest: allow(), passwordResetRedeem: allow(), emailVerificationRequest: allow(), emailVerificationRedeem: allow() },
        nodeEnv: 'test'
    });
    for (const route of ['POST /register','POST /login','POST /password-reset/request','POST /password-reset/confirm','POST /email-verification/request','POST /email-verification/confirm']) {
        const { res, nextError } = await runRoute(routes.get(route));
        assert.equal(nextError, undefined, route);
        assert.notEqual(res.statusCode, 503, route);
    }
    assert.deepEqual(calls, { register: 1, login: 1, resetRequest: 1, resetConfirm: 1, verifyRequest: 1, verifyConfirm: 1 });
});


test('429 from any sensitive-route limiter prevents its handler from running', async () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const express = { Router: () => router };
    const calls = { register: 0, login: 0, resetRequest: 0, resetConfirm: 0, verifyRequest: 0, verifyConfirm: 0 };
    const blocked = async (_req, res) => res.status(429).json({ success: false, error: { code: 'RATE_LIMITED' } });
    createAuthRouter({
        express,
        services: {
            async register() { calls.register++; return { success: false }; },
            async login() { calls.login++; return { success: false }; },
            async authenticateSession() { return null; },
            async revokeSession() {}
        },
        passwordReset: {
            async createPasswordReset() { calls.resetRequest++; return null; },
            async redeemPasswordReset() { calls.resetConfirm++; return { success: false }; }
        },
        emailVerification: {
            async createEmailVerification() { calls.verifyRequest++; return null; },
            async redeemEmailVerification() { calls.verifyConfirm++; return { success: false }; }
        },
        sendPasswordResetEmail: async () => {}, sendEmailVerificationEmail: async () => {},
        limiters: { registration: blocked, login: blocked, passwordResetRequest: blocked, passwordResetRedeem: blocked, emailVerificationRequest: blocked, emailVerificationRedeem: blocked }
    });
    const routesToCheck = [
        'POST /register',
        'POST /login',
        'POST /password-reset/request',
        'POST /password-reset/confirm',
        'POST /email-verification/request',
        'POST /email-verification/confirm'
    ];
    for (const route of routesToCheck) {
        const { res, nextError } = await runRoute(routes.get(route));
        assert.equal(nextError, undefined, route);
        assert.equal(res.statusCode, 429, route);
        assert.equal(res.body.error.code, 'RATE_LIMITED', route);
    }
    assert.deepEqual(calls, { register: 0, login: 0, resetRequest: 0, resetConfirm: 0, verifyRequest: 0, verifyConfirm: 0 });
});

test('registration succeeds with honest messaging when verification email delivery fails', async () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const pass = async (_req, _res, next) => next();
    const calls = { issued: 0, sent: 0 };
    createAuthRouter({
        express: { Router: () => router },
        services: {
            async register() {
                return { success: true, user: { id: 'user-1', email_normalized: 'person@example.com' } };
            },
            async login() { return { success: false }; },
            async authenticateSession() { return null; },
            async revokeSession() {}
        },
        passwordReset: { async createPasswordReset() { return null; }, async redeemPasswordReset() { return { success: false }; } },
        emailVerification: {
            async createEmailVerification() {
                calls.issued++;
                return { email: 'person@example.com', token: 'opaque-token' };
            },
            async redeemEmailVerification() { return { success: false }; }
        },
        sendPasswordResetEmail: async () => {},
        sendEmailVerificationEmail: async () => {
            calls.sent++;
            const error = new Error('provider failure');
            error.code = 'EMAIL_VERIFICATION_EMAIL_FAILED';
            throw error;
        },
        limiters: {
            registration: pass, login: pass, passwordResetRequest: pass,
            passwordResetRedeem: pass, emailVerificationRequest: pass, emailVerificationRedeem: pass
        },
        nodeEnv: 'test'
    });

    const originalError = console.error;
    console.error = () => {};
    try {
        const { res, nextError } = await runRoute(routes.get('POST /register'));
        assert.equal(nextError, undefined);
        assert.equal(res.statusCode, 201);
        assert.equal(res.body.success, true);
        assert.match(res.body.message, /verification could not be sent/i);
        assert.deepEqual(calls, { issued: 1, sent: 1 });
    } finally {
        console.error = originalError;
    }
});

test('verification resend returns the same generic response when delivery fails', async () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const pass = async (_req, _res, next) => next();
    let requestedEmail;
    let deliveryAttempts = 0;
    createAuthRouter({
        express: { Router: () => router },
        services: {
            async register() { return { success: false }; },
            async login() { return { success: false }; },
            async authenticateSession() { return null; },
            async revokeSession() {}
        },
        passwordReset: { async createPasswordReset() { return null; }, async redeemPasswordReset() { return { success: false }; } },
        emailVerification: {
            async createEmailVerification(email) {
                requestedEmail = email;
                return { email: 'person@example.com', token: 'opaque-token' };
            },
            async redeemEmailVerification() { return { success: false }; }
        },
        sendPasswordResetEmail: async () => {},
        sendEmailVerificationEmail: async () => {
            deliveryAttempts++;
            throw new Error('provider failure');
        },
        limiters: {
            registration: pass, login: pass, passwordResetRequest: pass,
            passwordResetRedeem: pass, emailVerificationRequest: pass, emailVerificationRedeem: pass
        },
        nodeEnv: 'test'
    });

    const originalError = console.error;
    console.error = () => {};
    try {
        const handlers = routes.get('POST /email-verification/request');
        const req = { ip: '198.51.100.2', body: { email: ' PERSON@example.com ' }, get() { return ''; } };
        const res = response();
        let index = 0;
        const next = () => { index++; };
        await handlers[0](req, res, next);
        await handlers[index](req, res, next);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.match(res.body.message, /if an unverified account matches that email/i);
        assert.equal(requestedEmail, ' PERSON@example.com ');
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(deliveryAttempts, 1);
    } finally {
        console.error = originalError;
    }
});
