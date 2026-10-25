'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { once } = require('node:events');
const adminRoutes = require('../routes/adminRoutes');

async function withServer(app, run) {
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
        await run('http://127.0.0.1:' + server.address().port);
    } finally {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
}

test('admin overview route denies an authenticated non-founder over HTTP', async () => {
    const previous = process.env.CHATTBM_FOUNDER_USER_ID;
    process.env.CHATTBM_FOUNDER_USER_ID = 'configured-founder-id';

    const app = express();
    // The route integration test isolates authorization from session-token parsing.
    // The existing requireAuth unit and application middleware remain the auth authority.
    app.use('/api/admin', (req, res, next) => {
        req.authUser = { id: 'ordinary-user-id' };
        next();
    }, adminRoutes);

    try {
        await withServer(app, async (baseUrl) => {
            const response = await fetch(baseUrl + '/api/admin/overview');
            const body = await response.json();
            assert.equal(response.status, 403);
            assert.equal(body.success, false);
            assert.equal(body.error.code, 'FOUNDER_ACCESS_DENIED');
        });
    } finally {
        if (previous === undefined) delete process.env.CHATTBM_FOUNDER_USER_ID;
        else process.env.CHATTBM_FOUNDER_USER_ID = previous;
    }
});
