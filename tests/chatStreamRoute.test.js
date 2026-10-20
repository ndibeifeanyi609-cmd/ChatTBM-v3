'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const express = require('express');
const http = require('node:http');

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
    if (request === '../chatInteraction/ChatInteractionBoundary') {
        return {
            handleInteraction: async () => ({ success: true, response: 'unused' }),
            handleStreamingInteraction: async (data, onDelta) => {
                assert.equal(data.userId, 'stream-test-user');
                assert.equal(data.interactionId, 'stream-test-1');
                await onDelta('first ');
                await new Promise(resolve => setTimeout(resolve, 20));
                await onDelta('second');
                return {
                    success: true,
                    userId: data.userId,
                    interactionId: data.interactionId,
                    response: 'first second'
                };
            }
        };
    }
    if (request === '../auth/chatIdentity') {
        return { authenticatedUserId: req => req.headers['x-test-user'] || null };
    }
    return originalLoad.call(this, request, parent, isMain);
};

const router = require('../routes/chatRoutes');

test('POST /api/chat/stream emits ordered NDJSON start, deltas, and completion over HTTP', async t => {
    const app = express();
    app.use(express.json());
    app.use('/api/chat', router);
    const server = http.createServer(app);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/chat/stream`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-test-user': 'stream-test-user'
        },
        body: JSON.stringify({
            interactionId: 'stream-test-1',
            message: 'Test streaming'
        })
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/x-ndjson/);
    assert.ok(response.body, 'response should expose a readable stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const events = [];
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
            if (line.trim()) events.push(JSON.parse(line));
        }
    }
    if (buffer.trim()) events.push(JSON.parse(buffer));

    assert.deepEqual(events.map(event => event.type), [
        'start', 'delta', 'delta', 'complete'
    ]);
    assert.deepEqual(events.filter(event => event.type === 'delta').map(event => event.text), [
        'first ', 'second'
    ]);
    assert.equal(events.at(-1).response, 'first second');
});

test('POST /api/chat/stream requires authentication', async t => {
    const app = express();
    app.use(express.json());
    app.use('/api/chat', router);
    const server = http.createServer(app);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));

    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chat/stream`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ interactionId: 'missing-auth', message: 'Hello' })
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, 'AUTHENTICATION_REQUIRED');
});
