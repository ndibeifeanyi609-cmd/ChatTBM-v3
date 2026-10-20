'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { GeminiProvider } = require('../services/GeminiProvider');

function makeProvider(chunks, failure) {
    const provider = new GeminiProvider({ apiKey: 'test-key' });
    provider.client = {
        models: {
            async generateContentStream(request) {
                assert.equal(request.model, provider.model);
                return (async function* () {
                    for (const chunk of chunks) {
                        yield chunk;
                    }
                    if (failure) throw failure;
                })();
            }
        }
    };
    return provider;
}

test('Gemini streamResponse emits ordered text and returns the complete response', async () => {
    const provider = makeProvider([{ text: 'Hel' }, { text: 'lo' }]);
    const deltas = [];
    const result = await provider.streamResponse({ message: 'hello' }, delta => deltas.push(delta));

    assert.deepEqual(deltas, ['Hel', 'lo']);
    assert.equal(result.success, true);
    assert.equal(result.response, 'Hello');
});

test('Gemini streamResponse rejects invalid requests and missing callbacks', async () => {
    const provider = new GeminiProvider({ apiKey: null });
    assert.equal((await provider.streamResponse({ message: '' }, () => {})).error.code, 'INVALID_REQUEST');
    assert.equal((await provider.streamResponse({ message: 'hello' })).error.code, 'INVALID_STREAM_CALLBACK');
    assert.equal((await provider.streamResponse({ message: 'hello' }, () => {})).error.code, 'PROVIDER_UNAVAILABLE');
});

test('Gemini streamResponse rejects an empty provider stream', async () => {
    const provider = makeProvider([{ candidates: [] }]);
    const result = await provider.streamResponse({ message: 'hello' }, () => {});
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'INVALID_PROVIDER_RESPONSE');
});

test('Gemini streamResponse normalizes failure after partial output', async () => {
    const provider = makeProvider([{ text: 'partial' }], new Error('mock stream failure'));
    const deltas = [];
    const result = await provider.streamResponse({ message: 'hello' }, delta => deltas.push(delta));

    assert.deepEqual(deltas, ['partial']);
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'PROVIDER_ERROR');
});
