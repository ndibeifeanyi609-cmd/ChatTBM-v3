'use strict';

const assert = require('assert');

const {
    createConversation,
    getConversation,
    updateConversation,
    transitionConversationLifecycle,
    closeConversation,
    addContextReference,
    removeContextReference,
    listConversationsByUser,
    deleteConversation
} = require('./ConversationBoundary');

const { createContext } = require('../context/ContextBoundary');

const suffix = Date.now();
const userA = 'conversation-test-a-' + suffix;
const userB = 'conversation-test-b-' + suffix;

const contextA = createContext({
    userId: userA,
    interactionId: 'conversation-test-interaction-a-' + suffix,
    value: {
        message: 'context-a'
    }
});

assert.strictEqual(contextA.success, true);

const contextB = createContext({
    userId: userB,
    interactionId: 'conversation-test-interaction-b-' + suffix,
    value: {
        message: 'context-b'
    }
});

assert.strictEqual(contextB.success, true);

const created = createConversation({
    userId: userA,
    conversationKey: 'conversation-' + suffix,
    metadata: {
        label: 'test'
    }
});

assert.strictEqual(created.success, true);
assert.ok(created.conversation);
assert.strictEqual(created.conversation.userId, userA);
assert.strictEqual(created.conversation.lifecycle, 'active');
assert.strictEqual(created.conversation.version, 1);
assert.deepStrictEqual(created.conversation.contextIds, []);

const id = created.conversation.id;

const ownerRead = getConversation(id, userA);

assert.strictEqual(ownerRead.success, true);
assert.strictEqual(ownerRead.conversation.id, id);

const wrongOwnerRead = getConversation(id, userB);

assert.strictEqual(wrongOwnerRead.success, false);
assert.strictEqual(
    wrongOwnerRead.code,
    'CONVERSATION_OWNERSHIP_CONFLICT'
);

const duplicate = createConversation({
    userId: userA,
    conversationKey: 'conversation-' + suffix,
    metadata: {
        label: 'different'
    }
});

assert.strictEqual(duplicate.success, false);

const updated = updateConversation(
    id,
    userA,
    {
        expectedVersion: 1,
        metadata: {
            label: 'updated'
        }
    }
);

assert.strictEqual(updated.success, true);
assert.strictEqual(updated.conversation.version, 2);
assert.strictEqual(updated.conversation.metadata.label, 'updated');

const stale = updateConversation(
    id,
    userA,
    {
        expectedVersion: 1,
        metadata: {
            label: 'stale'
        }
    }
);

assert.strictEqual(stale.success, false);
assert.strictEqual(stale.code, 'CONVERSATION_CONFLICT');

const added = addContextReference(
    id,
    userA,
    contextA.context.id,
    2
);

assert.strictEqual(added.success, true);
assert.strictEqual(added.conversation.version, 3);
assert.deepStrictEqual(
    added.conversation.contextIds,
    [contextA.context.id]
);

const duplicateReference = addContextReference(
    id,
    userA,
    contextA.context.id,
    3
);

assert.strictEqual(duplicateReference.success, true);
assert.strictEqual(duplicateReference.idempotent, true);
assert.strictEqual(duplicateReference.conversation.version, 3);

const unauthorizedReference = addContextReference(
    id,
    userA,
    contextB.context.id,
    3
);

assert.strictEqual(unauthorizedReference.success, false);
assert.strictEqual(
    unauthorizedReference.code,
    'CONTEXT_REFERENCE_INVALID'
);

const missingReference = addContextReference(
    id,
    userA,
    'missing-context-' + suffix,
    3
);

assert.strictEqual(missingReference.success, false);
assert.strictEqual(
    missingReference.code,
    'CONTEXT_REFERENCE_INVALID'
);

const staleReference = addContextReference(
    id,
    userA,
    'another-context-' + suffix,
    2
);

assert.strictEqual(staleReference.success, false);

const afterReferenceFailures = getConversation(id, userA);

assert.strictEqual(afterReferenceFailures.success, true);
assert.strictEqual(afterReferenceFailures.conversation.version, 3);
assert.deepStrictEqual(
    afterReferenceFailures.conversation.contextIds,
    [contextA.context.id]
);

const removed = removeContextReference(
    id,
    userA,
    contextA.context.id,
    3
);

assert.strictEqual(removed.success, true);
assert.strictEqual(removed.conversation.version, 4);
assert.deepStrictEqual(removed.conversation.contextIds, []);

const closed = closeConversation(id, userA);

assert.strictEqual(closed.success, true);
assert.strictEqual(closed.conversation.lifecycle, 'closed');
assert.strictEqual(closed.conversation.version, 4);

const repeatedClose = closeConversation(id, userA);

assert.strictEqual(repeatedClose.success, true);
assert.strictEqual(repeatedClose.idempotent, true);

const reopened = transitionConversationLifecycle(
    id,
    userA,
    'active'
);

assert.strictEqual(reopened.success, false);
assert.strictEqual(
    reopened.code,
    'CONVERSATION_INVALID_LIFECYCLE_TRANSITION'
);

const ownerList = listConversationsByUser(userA);

assert.strictEqual(ownerList.success, true);
assert.strictEqual(
    ownerList.conversations.some(conversation => conversation.id === id),
    true
);

const otherOwnerList = listConversationsByUser(userB);

assert.strictEqual(otherOwnerList.success, true);
assert.strictEqual(
    otherOwnerList.conversations.some(conversation => conversation.id === id),
    false
);

const wrongOwnerDelete = deleteConversation(id, userB);

assert.strictEqual(wrongOwnerDelete.success, false);
assert.strictEqual(
    wrongOwnerDelete.code,
    'CONVERSATION_OWNERSHIP_CONFLICT'
);

const deleted = deleteConversation(id, userA);

assert.strictEqual(deleted.success, true);
assert.strictEqual(deleted.deleted, true);

const afterDelete = getConversation(id, userA);

assert.strictEqual(afterDelete.success, false);
assert.strictEqual(
    afterDelete.code,
    'CONVERSATION_NOT_FOUND'
);

console.log('\n=== CONVERSATION BOUNDARY TEST PASSED ===\n');
