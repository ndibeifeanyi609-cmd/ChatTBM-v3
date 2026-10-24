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
