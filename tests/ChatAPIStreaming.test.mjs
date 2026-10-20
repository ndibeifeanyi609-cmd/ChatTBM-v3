import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReplyStream } from '../ui/ChatAPI.mjs';

test('browser streaming client forwards each delta before completion', async () => {
    const originalFetch = globalThis.fetch;
    const originalWindow = globalThis.window;
    const events = [
        { type: 'start' },
        { type: 'delta', text: 'Hello ' },
        { type: 'delta', text: 'from ChatTBM.' },
        { type: 'complete', response: 'Hello from ChatTBM.' }
    ];

    globalThis.window = {
        location: { hostname: 'localhost' },
        sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        }
    };

    globalThis.fetch = async () => new Response(
        events.map(event => JSON.stringify(event) + '\n').join(''),
        { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } }
    );

    try {
        const deltas = [];
        let requestResolved = false;
        const resultPromise = generateReplyStream({
            message: 'Test streaming',
            userId: 'test-user',
            context: { interactionId: 'stream-test-1' },
            onDelta: async delta => {
                assert.equal(requestResolved, false);
                deltas.push(delta);
            }
        }).then(result => {
            requestResolved = true;
            return result;
        });

        const result = await resultPromise;
        assert.deepEqual(deltas, ['Hello ', 'from ChatTBM.']);
        assert.equal(result.success, true);
        assert.equal(result.response, 'Hello from ChatTBM.');
    } finally {
        globalThis.fetch = originalFetch;
        if (originalWindow === undefined) delete globalThis.window;
        else globalThis.window = originalWindow;
    }
});
