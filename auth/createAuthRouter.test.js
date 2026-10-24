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
    const calls = { register: 0, login: 0, resetRequest: 0, resetConfirm: 0 };
    const services = {
        async register() { calls.register++; return { success: false, error: 'unused', code: 'INVALID_REGISTRATION' }; },
        async login() { calls.login++; return { success: false, error: 'unused' }; },
        async authenticateSession() { return null; },
        async revokeSession() {}
    };
    const passwordReset = {
        async createPasswordReset() { calls.resetRequest++; return null; },
        async redeemPasswordReset() { calls.resetConfirm++; return { success: false }; }
    };
    const failClosed = () => createSharedRateLimiter({ store: { async consume() { throw new Error('database offline'); } } });
    const routerInstance = createAuthRouter({
        express, services, passwordReset, sendPasswordResetEmail: async () => {},
        limiters: { registration: failClosed(), login: failClosed(), passwordResetRequest: failClosed(), passwordResetRedeem: failClosed() },
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
        ['POST /password-reset/confirm', 'resetConfirm']
    ];
    for (const [route, service] of cases) {
        const { res, nextError } = await runRoute(routes.get(route));
        assert.equal(nextError, undefined);
        assert.equal(res.statusCode, 503, route);
        assert.equal(res.body.error.code, 'RATE_LIMIT_STORAGE_UNAVAILABLE', route);
    }
    assert.deepEqual(calls, { register: 0, login: 0, resetRequest: 0, resetConfirm: 0 });
});

test('routes use distinct injected limiter functions in the intended order', () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const express = { Router: () => router };
    const noop = () => {};
    const limiters = { registration: function registerLimit(){}, login: function loginLimit(){}, passwordResetRequest: function resetRequestLimit(){}, passwordResetRedeem: function resetConfirmLimit(){} };
    createAuthRouter({
        express,
        services: { register: async()=>({success:false}), login: async()=>({success:false}), authenticateSession: async()=>null, revokeSession: async()=>{} },
        passwordReset: { createPasswordReset: async()=>null, redeemPasswordReset: async()=>({success:false}) },
        sendPasswordResetEmail: async()=>{},
        limiters
    });
    assert.equal(routes.get('POST /register')[0], limiters.registration);
    assert.equal(routes.get('POST /login')[0], limiters.login);
    assert.equal(routes.get('POST /password-reset/request')[0], limiters.passwordResetRequest);
    assert.equal(routes.get('POST /password-reset/confirm')[0], limiters.passwordResetRedeem);
    assert.equal(routes.get('GET /me').length, 1);
    assert.equal(routes.get('POST /logout').length, 1);
});

test('allowed requests reach their intended authentication handlers', async () => {
    const routes = new Map();
    const router = { post(path, ...handlers) { routes.set('POST ' + path, handlers); }, get(path, ...handlers) { routes.set('GET ' + path, handlers); } };
    const express = { Router: () => router };
    const calls = { register: 0, login: 0, resetRequest: 0, resetConfirm: 0 };
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
        sendPasswordResetEmail: async()=>{},
        limiters: { registration: allow(), login: allow(), passwordResetRequest: allow(), passwordResetRedeem: allow() },
        nodeEnv: 'test'
    });
    for (const route of ['POST /register','POST /login','POST /password-reset/request','POST /password-reset/confirm']) {
        const { res, nextError } = await runRoute(routes.get(route));
        assert.equal(nextError, undefined, route);
        assert.notEqual(res.statusCode, 503, route);
    }
    assert.deepEqual(calls, { register: 1, login: 1, resetRequest: 1, resetConfirm: 1 });
});
