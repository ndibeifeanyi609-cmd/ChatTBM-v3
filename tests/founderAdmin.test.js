'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFounderAuthorization } = require('../admin/founderAuthorization');
const { createAdminOverviewHandler } = require('../controllers/adminOverviewController');

function responseMock() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('founder authorization fails closed when founder ID is not configured', async () => {
    const previous = process.env.CHATTBM_FOUNDER_USER_ID;
    delete process.env.CHATTBM_FOUNDER_USER_ID;
    try {
        const res = responseMock();
        let calledNext = false;
        await createFounderAuthorization({ getPool: () => { throw new Error('must not query'); } })(
            { authUser: { id: 'founder-id' } }, res, () => { calledNext = true; }
        );
        assert.equal(res.statusCode, 403);
        assert.equal(calledNext, false);
    } finally {
        if (previous === undefined) delete process.env.CHATTBM_FOUNDER_USER_ID;
        else process.env.CHATTBM_FOUNDER_USER_ID = previous;
    }
});

test('ordinary authenticated user is denied', async () => {
    const previous = process.env.CHATTBM_FOUNDER_USER_ID;
    process.env.CHATTBM_FOUNDER_USER_ID = 'founder-id';
    try {
        const res = responseMock();
        await createFounderAuthorization({ getPool: () => { throw new Error('must not query'); } })(
            { authUser: { id: 'ordinary-user' } }, res, () => assert.fail('next must not run')
        );
        assert.equal(res.statusCode, 403);
        assert.equal(res.body.error.code, 'FOUNDER_ACCESS_DENIED');
    } finally {
        if (previous === undefined) delete process.env.CHATTBM_FOUNDER_USER_ID;
        else process.env.CHATTBM_FOUNDER_USER_ID = previous;
    }
});

test('founder is denied when account is not verified or enabled', async () => {
    const previous = process.env.CHATTBM_FOUNDER_USER_ID;
    process.env.CHATTBM_FOUNDER_USER_ID = 'founder-id';
    try {
        const res = responseMock();
        let calledNext = false;
        await createFounderAuthorization({
            getPool: () => ({ query: async () => ({ rows: [] }) })
        })({ authUser: { id: 'founder-id' } }, res, () => { calledNext = true; });
        assert.equal(res.statusCode, 403);
        assert.equal(calledNext, false);
    } finally {
        if (previous === undefined) delete process.env.CHATTBM_FOUNDER_USER_ID;
        else process.env.CHATTBM_FOUNDER_USER_ID = previous;
    }
});

test('founder authorization returns controlled unavailable on database failure', async () => {
    const previous = process.env.CHATTBM_FOUNDER_USER_ID;
    process.env.CHATTBM_FOUNDER_USER_ID = 'founder-id';
    try {
        const res = responseMock();
        await createFounderAuthorization({
            getPool: () => ({ query: async () => { throw new Error('private db details'); } })
        })({ authUser: { id: 'founder-id' } }, res, () => assert.fail('next must not run'));
        assert.equal(res.statusCode, 503);
        assert.equal(res.body.error.code, 'FOUNDER_AUTHORIZATION_UNAVAILABLE');
        assert.equal(JSON.stringify(res.body).includes('private db details'), false);
    } finally {
        if (previous === undefined) delete process.env.CHATTBM_FOUNDER_USER_ID;
        else process.env.CHATTBM_FOUNDER_USER_ID = previous;
    }
});

test('admin overview returns aggregate counts and labels missing telemetry unavailable', async () => {
    const res = responseMock();
    await createAdminOverviewHandler({
        checkDatabase: async () => ({ connected: true, status: 'connected' }),
        getPool: () => ({ query: async () => ({ rows: [{ registered_users: 3 }] }) })
    })({}, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.registeredUsers, 3);
    assert.equal(res.body.data.usage.status, 'unavailable');
    assert.equal(res.body.data.providerCosts.status, 'unavailable');
    assert.equal(Object.hasOwn(res.body.data, 'users'), false);
});

test('admin overview returns 503 instead of false zero when database is unavailable', async () => {
    const res = responseMock();
    await createAdminOverviewHandler({
        checkDatabase: async () => ({ connected: false, status: 'error' }),
        getPool: () => { throw new Error('must not query'); }
    })({}, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.success, false);
});
