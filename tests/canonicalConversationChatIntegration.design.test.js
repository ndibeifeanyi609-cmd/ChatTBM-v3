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


test('chat integration creates one canonical Conversation and links its Context', async (t) => {
    if (process.env.DATABASE_URL) {
        t.skip('Uses isolated file persistence; database integration is covered separately.');
        return;
    }

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const conversationPersistence = require('../conversation/ConversationPersistence');
    const contextPersistence = require('../context/ContextPersistence');
    const { createContext } = require('../context/ContextBoundary');
    const ConversationBoundary = require('../conversation/ConversationBoundary');
    const { ensureCanonicalConversation } = require('../chatInteraction/ChatInteractionBoundary');

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-conversation-'));
    conversationPersistence.configureConversationPersistence(path.join(dir, 'conversations.json'));
    contextPersistence.clearContexts();

    try {
        const userId = 'integration-test-user';
        const interactionId = 'integration-test-interaction';
        const context = await createContext({
            userId,
            interactionId,
            value: { message: 'hello' }
        });
        assert.equal(context.success, true);

        const first = await ensureCanonicalConversation(userId, interactionId, context.context.id);
        assert.equal(first.success, true);
        assert.deepEqual(first.conversation.contextIds, [context.context.id]);

        const repeated = await ensureCanonicalConversation(userId, interactionId, context.context.id);
        assert.equal(repeated.success, true);
        assert.equal(repeated.conversation.id, first.conversation.id);

        const stored = await ConversationBoundary.getConversation(first.conversation.id, userId);
        assert.equal(stored.success, true);
        assert.deepEqual(stored.conversation.contextIds, [context.context.id]);

        const otherUser = await ConversationBoundary.getConversation(first.conversation.id, 'different-user');
        assert.equal(otherUser.success, false);
        assert.equal(otherUser.code, 'CONVERSATION_OWNERSHIP_CONFLICT');

        const foreignContext = await createContext({
            userId: 'different-user',
            interactionId,
            value: { message: 'must not link across users' }
        });
        assert.equal(foreignContext.success, true);

        const rejectedLink = await ensureCanonicalConversation(
            userId,
            interactionId,
            foreignContext.context.id
        );
        assert.equal(rejectedLink.success, false);
    } finally {
        contextPersistence.clearContexts();
        fs.rmSync(dir, { recursive: true, force: true });
    }
});


test('canonical Conversation linking fails safely for a missing Context', async (t) => {
    if (process.env.DATABASE_URL) {
        t.skip('Uses isolated file persistence; database integration is covered separately.');
        return;
    }

    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const persistence = require('../conversation/ConversationPersistence');
    const ConversationBoundary = require('../conversation/ConversationBoundary');
    const { ensureCanonicalConversation } = require('../chatInteraction/ChatInteractionBoundary');

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chattbm-conversation-failure-'));
    persistence.configureConversationPersistence(path.join(dir, 'conversations.json'));

    try {
        const userId = 'failure-test-user';
        const interactionId = 'failure-test-interaction';
        const result = await ensureCanonicalConversation(
            userId,
            interactionId,
            'context_does_not_exist'
        );

        assert.equal(result.success, false);
        assert.ok(result.code);

        const conversationId = createConversationId(userId, interactionId);
        const stored = await ConversationBoundary.getConversation(conversationId, userId);
        assert.equal(stored.success, true);
        assert.deepEqual(stored.conversation.contextIds, []);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
