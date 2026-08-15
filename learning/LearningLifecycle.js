const {
    createLearningObject
} = require("./LearningObject");

// =====================================
// LEARNING LIFECYCLE STATES
// =====================================

const LearningLifecycleStates = Object.freeze({
    PROPOSED: "proposed",
    VALIDATED: "validated",
    ACTIVE: "active",
    SUPERSEDED: "superseded",
    REJECTED: "rejected"
});

// =====================================
// VALID TRANSITIONS
// =====================================

const VALID_TRANSITIONS = Object.freeze({
    proposed: ["validated", "rejected"],
    validated: ["active", "rejected"],
    active: ["superseded"],
    superseded: [],
    rejected: []
});

// =====================================
// VALIDATE LIFECYCLE STATE
// =====================================

function isValidLifecycleState(state) {
    return Object.values(
        LearningLifecycleStates
    ).includes(state);
}

// =====================================
// CHECK LIFECYCLE TRANSITION
// =====================================

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

    return (
        VALID_TRANSITIONS[currentState] || []
    ).includes(nextState);
}

// =====================================
// TRANSITION LEARNING
// =====================================

function transitionLearning(learning, nextState) {

    if (!learning) {
        return {
            success: false,
            learning: null,
            error: "Learning object is required."
        };
    }

    const currentState =
        learning.lifecycle ||
        LearningLifecycleStates.PROPOSED;

    if (!canTransition(currentState, nextState)) {
        return {
            success: false,
            learning,
            error:
                `Invalid learning lifecycle transition: ${currentState} → ${nextState}`
        };
    }

    if (currentState === nextState) {
        return {
            success: true,
            learning,
            previousState: currentState,
            currentState: nextState,
            idempotent: true
        };
    }

    return {
        success: true,
        learning: {
            ...learning,
            lifecycle: nextState,
            updatedAt: new Date().toISOString()
        },
        previousState: currentState,
        currentState: nextState,
        idempotent: false
    };
}

// =====================================
// CREATE LIFECYCLE LEARNING
// =====================================

function createLifecycleLearning(data = {}) {

    return createLearningObject({
        ...data,
        lifecycle:
            LearningLifecycleStates.PROPOSED
    });
}

// =====================================
// GET NEXT STATES
// =====================================

function getNextStates(state) {

    if (!isValidLifecycleState(state)) {
        return [];
    }

    return [
        ...(VALID_TRANSITIONS[state] || [])
    ];
}

module.exports = {
    LearningLifecycleStates,
    isValidLifecycleState,
    canTransition,
    transitionLearning,
    createLifecycleLearning,
    getNextStates
};
