'use strict';

// =====================================
// ChatTBM
// REG-090 Context
//
// Canonical Context Lifecycle
// =====================================

const ContextLifecycleStates = Object.freeze({
    ACTIVE: 'active',
    CLOSED: 'closed'
});

const VALID_TRANSITIONS = Object.freeze({
    active: ['closed'],
    closed: []
});

const TERMINAL_STATES = Object.freeze([
    'closed'
]);

function isValidLifecycleState(state) {
    return Object.values(
        ContextLifecycleStates
    ).includes(state);
}

function isTerminalState(state) {
    return TERMINAL_STATES.includes(state);
}

function canTransition(currentState, nextState) {
    if (
        !isValidLifecycleState(currentState) ||
        !isValidLifecycleState(nextState)
    ) {
        return false;
    }

    if (currentState === nextState) {
        return true;
    }

    if (isTerminalState(currentState)) {
        return false;
    }

    return (
        VALID_TRANSITIONS[currentState] || []
    ).includes(nextState);
}

function transitionContext(context, nextState) {
    if (!context) {
        return {
            success: false,
            context: null,
            error: 'Context object is required.'
        };
    }

    const currentState =
        context.lifecycle ||
        ContextLifecycleStates.ACTIVE;

    if (!canTransition(currentState, nextState)) {
        return {
            success: false,
            context,
            error:
                `Invalid context lifecycle transition: ${currentState} → ${nextState}`
        };
    }

    if (currentState === nextState) {
        return {
            success: true,
            context,
            previousState: currentState,
            currentState: nextState,
            idempotent: true
        };
    }

    return {
        success: true,
        context: {
            ...context,
            lifecycle: nextState,
            updatedAt: new Date().toISOString()
        },
        previousState: currentState,
        currentState: nextState,
        idempotent: false
    };
}

function getNextStates(state) {
    if (!isValidLifecycleState(state)) {
        return [];
    }

    return [
        ...(VALID_TRANSITIONS[state] || [])
    ];
}

module.exports = {
    ContextLifecycleStates,
    VALID_TRANSITIONS,
    TERMINAL_STATES,
    isValidLifecycleState,
    isTerminalState,
    canTransition,
    transitionContext,
    getNextStates
};
