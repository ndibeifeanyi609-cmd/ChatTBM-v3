'use strict';

// =====================================
// ChatTBM
// REG-089 Profile/Identity
//
// Canonical Profile Lifecycle
// =====================================

const PROFILE_LIFECYCLE_STATES = Object.freeze([
    'proposed',
    'active',
    'superseded',
    'rejected'
]);

const VALID_TRANSITIONS = Object.freeze({ proposed: ['active','rejected'], active: ['superseded'], superseded: [], rejected: [] });

const TERMINAL_STATES = Object.freeze(['superseded','rejected']);

function isValidLifecycleState(state) {
    return PROFILE_LIFECYCLE_STATES.includes(state);
}

function isTerminalState(state) {
    return TERMINAL_STATES.includes(state);
}

function canTransition(currentState, nextState) {
    if (!isValidLifecycleState(currentState) || !isValidLifecycleState(nextState)) return false;
    if (currentState === nextState) return true;
    if (isTerminalState(currentState)) return false;
    return (VALID_TRANSITIONS[currentState] || []).includes(nextState);
}

function transitionProfile(profile, nextState) {
    if (!profile) return { success: false, profile: null, error: 'Profile object is required.' };
    const currentState = profile.lifecycle || 'proposed';
    if (!canTransition(currentState, nextState)) return { success: false, profile, error: 'Invalid profile lifecycle transition: ' + currentState + ' -> ' + nextState };

    if (currentState === nextState) return { success: true, profile, previousState: currentState, currentState: nextState, idempotent: true };
    return { success: true, profile: { ...profile, lifecycle: nextState, updatedAt: new Date().toISOString() }, previousState: currentState, currentState: nextState, idempotent: false };
}

module.exports = {
    PROFILE_LIFECYCLE_STATES,
    isValidLifecycleState,
    canTransition,
    transitionProfile
};
