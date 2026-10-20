'use strict';

// Optional real PostgreSQL verification. Only runs when an explicitly disposable
// CHATTBM_TEST_DATABASE_URL is supplied; never uses the production DATABASE_URL.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

test('PostgreSQL Conversation persistence is idempotent and rejects stale versions', async (t) => {
    const testDatabaseUrl = process.env.CHATTBM_TEST_DATABASE_URL;
    if (!testDatabaseUrl) {
        t.skip('Set CHATTBM_TEST_DATABASE_URL to a disposable test database to run PostgreSQL integration.');
        return;
    }

    if (testDatabaseUrl === process.env.DATABASE_URL) {
        throw new Error('Refusing to run destructive integration cleanup against DATABASE_URL; use a separate test database.');
    }

    process.env.DATABASE_URL = testDatabaseUrl;
    const { initializeDatabase, closeDatabase } = require('../database/Postgres');
    const persistence = require('../database/PostgresConversationPersistence');
    const { createConversationObject } = require('../conversation/ConversationObject');

    const suffix = crypto.randomBytes(8).toString('hex');
    const userId = 'ci-conversation-user-' + suffix;
    const conversationKey = 'ci-conversation-key-' + suffix;
    let conversationId;

    try {
        await initializeDatabase();
        const created = createConversationObject({ userId, conversationKey });
        assert.equal(created.success, true);
        conversationId = created.conversation.id;

        const firstSave = await persistence.saveConversation(created.conversation);
        assert.equal(firstSave.success, true);

        const repeatedSave = await persistence.saveConversation(created.conversation);
        assert.equal(repeatedSave.success, true);
        assert.equal(repeatedSave.idempotent, true);

        const loaded = await persistence.getConversation(conversationId, userId);
        assert.equal(loaded.success, true);
        assert.equal(loaded.conversation.version, 1);

        const updatedValue = {
            ...loaded.conversation,
            contextIds: ['test-context-reference'],
            updatedAt: new Date().toISOString()
        };
        const updated = await persistence.updateConversationContextIds(updatedValue, 1);
        assert.equal(updated.success, true);
        assert.equal(updated.conversation.version, 2);
        assert.deepEqual(updated.conversation.contextIds, ['test-context-reference']);

        const stale = await persistence.updateConversationContextIds({
            ...updated.conversation,
            contextIds: ['stale-overwrite'],
            updatedAt: new Date().toISOString()
        }, 1);
        assert.equal(stale.success, false);
        assert.equal(stale.code, 'CONVERSATION_CONFLICT');

        const finalValue = await persistence.getConversation(conversationId, userId);
        assert.deepEqual(finalValue.conversation.contextIds, ['test-context-reference']);
    } finally {
        if (conversationId) {
            try { await persistence.deleteConversation(conversationId, userId); } catch (_) {}
        }
        await closeDatabase();
    }
});
