'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Canonical Transient Orchestration Lifecycle
// =====================================

const IntelligenceOrchestrationLifecycleStates =
    Object.freeze({
        REQUESTED: 'requested',
        RESOLVING: 'resolving',
        COMPOSED: 'composed',
        COMPLETED: 'completed',
        FAILED: 'failed'
    });

const VALID_TRANSITIONS = Object.freeze({
    requested: ['resolving'],
    resolving: ['composed', 'failed'],
    composed: ['completed', 'failed'],
    completed: [],
    failed: []
});

const TERMINAL_STATES = Object.freeze([
    'completed',
    'failed'
]);

function isValidLifecycleState(state) {
    return Object.values(
        IntelligenceOrchestrationLifecycleStates
    ).includes(state);
}

function isTerminalState(state) {
    return TERMINAL_STATES.includes(state);
}

function canTransition(currentState, nextState) {
    if (!isValidLifecycleState(currentState)) {
        return false;
    }

    if (!isValidLifecycleState(nextState)) {
        return false;
    }

    if (currentState === nextState) {
        return true;
    }

    if (isTerminalState(currentState)) {
        return false;
    }

    return (
        VALID_TRANSITIONS[currentState] ||
        []
    ).includes(nextState);
}

function transitionIntelligenceOrchestration(
    orchestration,
    nextState
) {
    if (!orchestration) {
        return {
            success: false,
            orchestration: null,
            error:
                'Intelligence orchestration object is required.'
        };
    }

    const currentState =
        orchestration.state ||
        IntelligenceOrchestrationLifecycleStates.REQUESTED;

    if (
        !canTransition(
            currentState,
            nextState
        )
    ) {
        return {
            success: false,
            orchestration,
            error:
                `Invalid intelligence orchestration lifecycle transition: ${currentState} → ${nextState}`
        };
    }

    if (currentState === nextState) {
        return {
            success: true,
            orchestration,
            previousState: currentState,
            currentState: nextState,
            idempotent: true
        };
    }

    return {
        success: true,
        orchestration: {
            ...orchestration,
            state: nextState,
            updatedAt:
                new Date().toISOString()
        },
        previousState: currentState,
        currentState: nextState,
        idempotent: false
    };
}

function createLifecycleOrchestration(data = {}) {
    return {
        ...data,
        state:
            IntelligenceOrchestrationLifecycleStates.REQUESTED
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
    IntelligenceOrchestrationLifecycleStates,
    VALID_TRANSITIONS,
    TERMINAL_STATES,
    isValidLifecycleState,
    isTerminalState,
    canTransition,
    transitionIntelligenceOrchestration,
    createLifecycleOrchestration,
    getNextStates
};
