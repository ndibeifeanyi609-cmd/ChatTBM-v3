'use strict';

const CONVERSATION_LIFECYCLE_STATES = Object.freeze({
    ACTIVE: 'active',
    CLOSED: 'closed'
});

const CONVERSATION_LIFECYCLE_TRANSITIONS = Object.freeze({
    active: Object.freeze(['closed']),
    closed: Object.freeze([])
});

function fail(message, code = 'INVALID_CONVERSATION_LIFECYCLE') {
    return {
        success: false,
        code,
        error: message
    };
}

function isValidConversationLifecycle(lifecycle) {
    return lifecycle === CONVERSATION_LIFECYCLE_STATES.ACTIVE ||
        lifecycle === CONVERSATION_LIFECYCLE_STATES.CLOSED;
}

function canTransitionConversationLifecycle(from, to) {
    if (!isValidConversationLifecycle(from) || !isValidConversationLifecycle(to)) {
        return false;
    }

    if (from === to) {
        return true;
    }

    return CONVERSATION_LIFECYCLE_TRANSITIONS[from].includes(to);
}

function transitionConversationLifecycle(conversation, nextLifecycle, updatedAt = new Date().toISOString()) {
    if (!conversation || typeof conversation !== 'object') {
        return fail('Conversation is required.');
    }

    if (!isValidConversationLifecycle(conversation.lifecycle)) {
        return fail('Conversation lifecycle is invalid.');
    }

    if (!isValidConversationLifecycle(nextLifecycle)) {
        return fail('Conversation target lifecycle is invalid.');
    }

    if (typeof updatedAt !== 'string' || updatedAt.trim() === '') {
        return fail('Conversation updatedAt is required.');
    }

    if (!canTransitionConversationLifecycle(conversation.lifecycle, nextLifecycle)) {
        return fail('Invalid Conversation lifecycle transition.', 'CONVERSATION_INVALID_LIFECYCLE_TRANSITION');
    }

    if (conversation.lifecycle === nextLifecycle) {
        return {
            success: true,
            conversation: { ...conversation }
        };
    }
    return {
        success: true,
        conversation: {
            ...conversation,
            lifecycle: nextLifecycle,
            updatedAt
        }
    };
}

module.exports = {
    CONVERSATION_LIFECYCLE_STATES,
    CONVERSATION_LIFECYCLE_TRANSITIONS,
    isValidConversationLifecycle,
    canTransitionConversationLifecycle,
    transitionConversationLifecycle
};
