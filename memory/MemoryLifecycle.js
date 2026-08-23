'use strict';

// =====================================
// ChatTBM
// REG-088 Memory
//
// Canonical Memory Lifecycle
// =====================================

const MemoryLifecycleStates = Object.freeze({

    PROPOSED: 'proposed',

    ACTIVE: 'active',

    SUPERSEDED: 'superseded',

    REJECTED: 'rejected'

});

// =====================================
// VALID TRANSITIONS
// =====================================

const VALID_TRANSITIONS = Object.freeze({

    proposed: [
        'active',
        'rejected'
    ],

    active: [
        'superseded'
    ],

    superseded: [],

    rejected: []

});

// =====================================
// TERMINAL STATES
// =====================================

const TERMINAL_STATES = Object.freeze([
    'superseded',
    'rejected'
]);

// =====================================
// VALIDATE STATE
// =====================================

function isValidLifecycleState(state) {

    return Object.values(
        MemoryLifecycleStates
    ).includes(state);

}

// =====================================
// CHECK TERMINAL STATE
// =====================================

function isTerminalState(state) {

    return TERMINAL_STATES.includes(
        state
    );

}

// =====================================
// CHECK TRANSITION
// =====================================

function canTransition(
    currentState,
    nextState
) {

    if (
        !isValidLifecycleState(
            currentState
        )
    ) {
        return false;
    }

    if (
        !isValidLifecycleState(
            nextState
        )
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
        VALID_TRANSITIONS[currentState] ||
        []
    ).includes(nextState);

}

// =====================================
// TRANSITION MEMORY
// =====================================

function transitionMemory(
    memory,
    nextState
) {

    if (!memory) {

        return {
            success: false,
            memory: null,
            error: 'Memory object is required.'
        };

    }

    const currentState =
        memory.lifecycle ||
        MemoryLifecycleStates.PROPOSED;

    if (
        !canTransition(
            currentState,
            nextState
        )
    ) {

        return {
            success: false,
            memory,
            error:
                `Invalid memory lifecycle transition: ${currentState} → ${nextState}`
        };

    }

    if (currentState === nextState) {

        return {
            success: true,
            memory,
            previousState: currentState,
            currentState: nextState,
            idempotent: true
        };

    }

    return {

        success: true,

        memory: {

            ...memory,

            lifecycle: nextState,

            updatedAt:
                new Date().toISOString()

        },

        previousState: currentState,

        currentState: nextState,

        idempotent: false

    };

}

// =====================================
// CREATE LIFECYCLE MEMORY
// =====================================

function createLifecycleMemory(
    data = {}
) {

    return {

        ...data,

        lifecycle:
            MemoryLifecycleStates.PROPOSED

    };

}

// =====================================
// GET NEXT STATES
// =====================================

function getNextStates(state) {

    if (
        !isValidLifecycleState(state)
    ) {
        return [];
    }

    return [
        ...(VALID_TRANSITIONS[state] || [])
    ];

}

module.exports = {

    MemoryLifecycleStates,

    VALID_TRANSITIONS,

    TERMINAL_STATES,

    isValidLifecycleState,

    isTerminalState,

    canTransition,

    transitionMemory,

    createLifecycleMemory,

    getNextStates

};
