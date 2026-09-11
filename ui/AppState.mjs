'use strict';

const UI_STATUS = Object.freeze({
    IDLE: 'idle',
    SUBMITTING: 'submitting',
    RESPONDING: 'responding',
    SUCCESS: 'success',
    ERROR: 'error'
});

function createInitialAppState() {
    return {
        navigation: {
            sidebarOpen: false,
            activeView: 'chat'
        },
        conversation: {
            interactionId: null,
            messages: [],
            status: UI_STATUS.IDLE
        },
        composer: {
            value: '',
            submitting: false
        },
        error: {
            currentError: null
        }
    };
}

function createMessage({
    id,
    role,
    content
} = {}) {
    if (typeof id !== 'string' || !id.trim()) {
        throw new Error('Message id is required.');
    }

    if (role !== 'user' && role !== 'assistant') {
        throw new Error('Message role must be user or assistant.');
    }

    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('Message content is required.');
    }

    return Object.freeze({
        id,
        role,
        content,
        timestamp: Date.now()
    });
}

export { UI_STATUS, createInitialAppState, createMessage };
