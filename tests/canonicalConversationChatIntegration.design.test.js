'use strict';

// REG-094 identity invariants required by canonical chat integration.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createConversationId, createConversationObject } = require('../conversation/ConversationObject');

test('canonical Conversation identity is stable for the same user and key', () => {
    const first = createConversationId('user-a', 'interaction-123');
    const repeated = createConversationId('user-a', 'interaction-123');

    assert.equal(first, repeated);
    assert.match(first, /^conversation_[a-f0-9]{64}$/);
});

test('canonical Conversation identity isolates users sharing an interactionId', () => {
    const first = createConversationId('user-a', 'interaction-123');
    const second = createConversationId('user-b', 'interaction-123');

    assert.notEqual(first, second);
});

test('canonical Conversation object rejects identity that does not match user and key', () => {
    const result = createConversationObject({
        id: createConversationId('user-a', 'interaction-123'),
        userId: 'user-b',
        conversationKey: 'interaction-123'
    });

    assert.equal(result.success, false);
    assert.equal(result.code, 'CONVERSATION_IDENTITY_CONFLICT');
});


test('canonical Conversation identity trims user and key consistently', () => {
    const normalized = createConversationId(' user-a ', ' interaction-123 ');
    const plain = createConversationId('user-a', 'interaction-123');
    assert.equal(normalized, plain);
});

test('canonical Conversation identity rejects missing user or key', () => {
    assert.equal(createConversationId('', 'interaction-123'), null);
    assert.equal(createConversationId('user-a', ''), null);
});

test('canonical Context linkage integration remains explicitly unverified until boundary tests exist', () => {
    // Guard against treating identity-only tests as proof of the full integration.
    assert.equal(typeof createConversationId, 'function');
    assert.equal(typeof createConversationObject, 'function');
});
