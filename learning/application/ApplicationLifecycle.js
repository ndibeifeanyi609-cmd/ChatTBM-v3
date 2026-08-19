'use strict';

// =====================================
// ChatTBM V7.0
// REG-087 Learning Application
//
// Application Lifecycle
//
// Responsibility:
// - Define canonical application states
// - Enforce valid application transitions
// - Prevent arbitrary lifecycle mutation
//
// Does NOT:
// - Execute applications
// - Persist applications
// - Mutate Learning objects
// - Implement target consumer logic
// =====================================

const APPLICATION_STATES = Object.freeze({
  REQUESTED: 'REQUESTED',
  APPLIED: 'APPLIED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  CONFLICTED: 'CONFLICTED'
});

const VALID_TRANSITIONS = Object.freeze({
  [APPLICATION_STATES.REQUESTED]: Object.freeze([
    APPLICATION_STATES.APPLIED,
    APPLICATION_STATES.REJECTED,
    APPLICATION_STATES.FAILED,
    APPLICATION_STATES.CONFLICTED
  ]),
  [APPLICATION_STATES.APPLIED]: Object.freeze([]),
  [APPLICATION_STATES.REJECTED]: Object.freeze([]),
  [APPLICATION_STATES.FAILED]: Object.freeze([]),
  [APPLICATION_STATES.CONFLICTED]: Object.freeze([])
});

function isApplicationState(state) {
  return Object.values(APPLICATION_STATES).includes(state);
}

function canTransitionApplication(currentState, nextState) {
  if (
    !isApplicationState(currentState) ||
    !isApplicationState(nextState)
  ) {
    return false;
  }

  return VALID_TRANSITIONS[currentState].includes(nextState);
}

function transitionApplication(currentState, nextState) {
  if (!isApplicationState(currentState)) {
    throw new Error(`Invalid application state: ${currentState}`);
  }

  if (!isApplicationState(nextState)) {
    throw new Error(`Invalid application state: ${nextState}`);
  }

  if (!canTransitionApplication(currentState, nextState)) {
    throw new Error(
      `Invalid application lifecycle transition: ${currentState} -> ${nextState}`
    );
  }

  return nextState;
}

module.exports = {
  APPLICATION_STATES,
  VALID_TRANSITIONS,
  isApplicationState,
  canTransitionApplication,
  transitionApplication
};
