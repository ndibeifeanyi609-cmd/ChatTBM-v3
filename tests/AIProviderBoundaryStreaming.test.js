'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { AIProviderBoundary } = require('../services/AIProviderBoundary');

function providerWith(streamResponse) {
    return {
        name: 'test',
        async generateResponse() {
            return { success: true, response: 'legacy response' };
        },
        streamResponse
    };
}

test('streamResponse validates request and callback', async () => {
    const boundary = new AIProviderBoundary();
    boundary.registerProvider('test', providerWith(async () => ({
        success: true, response: 'ok'
    })));
    boundary.setProvider('test');

    assert.equal((await boundary.streamResponse({ message: ' ' }, () => {})).error.code, 'INVALID_REQUEST');
    assert.equal((await boundary.streamResponse({ message: 'hello' })).error.code, 'INVALID_STREAM_CALLBACK');
});

test('streamResponse emits ordered deltas and normalizes completion', async () => {
    const boundary = new AIProviderBoundary();
    boundary.registerProvider('test', providerWith(async (_request, onDelta) => {
        await onDelta('Hel');
        await onDelta('lo');
        return { success: true, response: 'Hello', provider: 'test', model: 'mock' };
    }));
    boundary.setProvider('test');

    const deltas = [];
    const result = await boundary.streamResponse({ message: 'hello' }, delta => deltas.push(delta));

    assert.deepEqual(deltas, ['Hel', 'lo']);
    assert.equal(result.success, true);
    assert.equal(result.response, 'Hello');
    assert.equal(result.provider, 'test');
});

test('streamResponse rejects providers without streaming support', async () => {
    const boundary = new AIProviderBoundary();
    boundary.registerProvider('test', {
        async generateResponse() {
            return { success: true, response: 'legacy' };
        }
    });
    boundary.setProvider('test');

    const result = await boundary.streamResponse({ message: 'hello' }, () => {});
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'STREAMING_UNSUPPORTED');
});

test('streamResponse normalizes provider failures and exceptions', async () => {
    const boundary = new AIProviderBoundary();
    boundary.registerProvider('test', providerWith(async () => ({
        success: false,
        error: { code: 'MOCK_FAILURE', message: 'controlled failure' }
    })));
    boundary.setProvider('test');

    const result = await boundary.streamResponse({ message: 'hello' }, () => {});
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MOCK_FAILURE');

    boundary.registerProvider('throwing', providerWith(async () => {
        throw new Error('stream broke');
    }));
    boundary.setProvider('throwing');
    const thrown = await boundary.streamResponse({ message: 'hello' }, () => {});
    assert.equal(thrown.success, false);
    assert.equal(thrown.error.code, 'PROVIDER_ERROR');
});
