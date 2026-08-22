'use strict';

const assert = require('assert');

const {
  APPLICATION_STATES,
  transitionApplication
} = require('../learning/application/ApplicationLifecycle');

const {
  createApplicationObject
} = require('../learning/application/ApplicationObject');

const {
  createApplicationKey,
  saveApplication,
  getApplication,
  clearApplications
} = require('../learning/application/ApplicationPersistence');

const {
  clearRegistry
} = require('../learning/application/ApplicationRegistry');

const {
  applyLearning
} = require('../learning/application/LearningApplicationBoundary');

function runFailureTests() {
  console.log(
    '\n=== REG-087 APPLICATION BOUNDARY FAILURE TEST ===\n'
  );

  clearApplications();
  clearRegistry();

  // =====================================
  // INVALID TERMINAL LIFECYCLE TRANSITIONS
  // =====================================

  assert.throws(
    () =>
      transitionApplication(
        APPLICATION_STATES.APPLIED,
        APPLICATION_STATES.FAILED
      ),
    /Invalid application lifecycle transition/
  );

  assert.throws(
    () =>
      transitionApplication(
        APPLICATION_STATES.FAILED,
        APPLICATION_STATES.APPLIED
      ),
    /Invalid application lifecycle transition/
  );

  assert.throws(
    () =>
      transitionApplication(
        APPLICATION_STATES.REJECTED,
        APPLICATION_STATES.APPLIED
      ),
    /Invalid application lifecycle transition/
  );

  assert.throws(
    () =>
      transitionApplication(
        APPLICATION_STATES.CONFLICTED,
        APPLICATION_STATES.APPLIED
      ),
    /Invalid application lifecycle transition/
  );

  console.log(
    '✓ Invalid terminal lifecycle transitions are rejected'
  );

  // =====================================
  // REJECTED TERMINAL NO RE-EXECUTION
  // =====================================

  clearApplications();
  clearRegistry();

  const rejectedApplication = createApplicationObject({
    id: 'application-rejected-terminal-test-001',
    learningId: 'learning-rejected-terminal-test-001',
    userId: 'guest',
    targetType: 'profile',
    targetId: 'profile-rejected-terminal-test-001',
    operation: 'apply-learning'
  });

  const rejectedRecord = {
    ...rejectedApplication,
    status: APPLICATION_STATES.REJECTED
  };

  const rejectedSaved = saveApplication(rejectedRecord);

  assert.strictEqual(
    rejectedSaved.created,
    true
  );

  const rejectedKey =
    createApplicationKey(rejectedRecord);

  assert.deepStrictEqual(
    getApplication(rejectedKey),
    rejectedRecord
  );

  let rejectedExecutionCount = 0;

  const rejectedConsumer = {
    apply() {
      rejectedExecutionCount += 1;

      return {
        success: true
      };
    }
  };

  const rejectedResult = applyLearning({
    learning: {
      id: rejectedRecord.learningId,
      userId: rejectedRecord.userId,
      type: 'preference',
      subject: 'response-style',
      learning: 'Prefer concise responses'
    },
    targetType: rejectedRecord.targetType,
    targetId: rejectedRecord.targetId,
    operation: rejectedRecord.operation,
    targetConsumer: rejectedConsumer
  });

  assert.strictEqual(
    rejectedResult.success,
    false
  );

  assert.strictEqual(
    rejectedResult.application.status,
    APPLICATION_STATES.REJECTED
  );

  assert.deepStrictEqual(
    rejectedResult.application,
    rejectedRecord
  );

  assert.strictEqual(
    rejectedExecutionCount,
    0
  );

  console.log(
    '✓ REJECTED terminal record prevents re-execution'
  );

  // =====================================
  // CONFLICTED TERMINAL NO RE-EXECUTION
  // =====================================

  clearApplications();
  clearRegistry();

  const conflictedApplication = createApplicationObject({
    id: 'application-conflicted-terminal-test-001',
    learningId: 'learning-conflicted-terminal-test-001',
    userId: 'guest',
    targetType: 'profile',
    targetId: 'profile-conflicted-terminal-test-001',
    operation: 'apply-learning'
  });

  const conflictedRecord = {
    ...conflictedApplication,
    status: APPLICATION_STATES.CONFLICTED
  };

  const conflictedSaved = saveApplication(conflictedRecord);

  assert.strictEqual(
    conflictedSaved.created,
    true
  );

  const conflictedKey =
    createApplicationKey(conflictedRecord);

  assert.deepStrictEqual(
    getApplication(conflictedKey),
    conflictedRecord
  );

  let conflictedExecutionCount = 0;

  const conflictedConsumer = {
    apply() {
      conflictedExecutionCount += 1;

      return {
        success: true
      };
    }
  };

  const conflictedResult = applyLearning({
    learning: {
      id: conflictedRecord.learningId,
      userId: conflictedRecord.userId,
      type: 'preference',
      subject: 'response-style',
      learning: 'Prefer concise responses'
    },
    targetType: conflictedRecord.targetType,
    targetId: conflictedRecord.targetId,
    operation: conflictedRecord.operation,
    targetConsumer: conflictedConsumer
  });

  assert.strictEqual(
    conflictedResult.success,
    false
  );

  assert.strictEqual(
    conflictedResult.application.status,
    APPLICATION_STATES.CONFLICTED
  );

  assert.deepStrictEqual(
    conflictedResult.application,
    conflictedRecord
  );

  assert.strictEqual(
    conflictedExecutionCount,
    0
  );

  console.log(
    '✓ CONFLICTED terminal record prevents re-execution'
  );

  // =====================================
  // UNKNOWN LIFECYCLE STATE
  // =====================================

  assert.throws(
    () =>
      transitionApplication(
        'UNKNOWN_STATE',
        APPLICATION_STATES.APPLIED
      ),
    /Invalid application state/
  );

  assert.throws(
    () =>
      transitionApplication(
        APPLICATION_STATES.REQUESTED,
        'UNKNOWN_STATE'
      ),
    /Invalid application state/
  );

  console.log(
    '✓ Unknown lifecycle states are rejected'
  );

  // =====================================
  // INVALID APPLICATION OBJECT INPUT
  // =====================================

  assert.throws(
    () =>
      createApplicationObject(null),
    /Application data must be an object/
  );

  assert.throws(
    () =>
      createApplicationObject({
        userId: 'guest',
        targetType: 'profile',
        targetId: 'profile-invalid-001',
        operation: 'apply-learning'
      }),
    /Missing required application field: learningId/
  );

  assert.throws(
    () =>
      createApplicationObject({
        learningId: 'learning-invalid-002',
        targetType: 'profile',
        targetId: 'profile-invalid-002'
      }),
    /Missing required application field: operation/
  );

  console.log(
    '✓ Invalid canonical application construction is rejected'
  );

  // =====================================
  // CONSUMER RESULT NORMALIZATION
  // =====================================

  clearApplications();
  clearRegistry();

  const normalizedLearning = {
    id: 'learning-result-normalization-001',
    userId: 'guest',
    type: 'preference',
    subject: 'response-style',
    learning: 'Prefer concise responses'
  };

  const undefinedResult = applyLearning({
    learning: normalizedLearning,
    targetType: 'profile',
    targetId: 'profile-result-undefined-001',
    operation: 'apply-learning',
    targetConsumer: {
      apply() {
        return undefined;
      }
    }
  });

  assert.strictEqual(
    undefinedResult.success,
    true
  );

  assert.strictEqual(
    undefinedResult.application.status,
    APPLICATION_STATES.APPLIED
  );

  const falseResult = applyLearning({
    learning: normalizedLearning,
    targetType: 'profile',
    targetId: 'profile-result-false-001',
    operation: 'apply-learning',
    targetConsumer: {
      apply() {
        return false;
      }
    }
  });

  assert.strictEqual(
    falseResult.success,
    false
  );

  assert.strictEqual(
    falseResult.application.status,
    APPLICATION_STATES.FAILED
  );

  console.log(
    '✓ Consumer results are normalized into controlled application states'
  );

  console.log(
    '\n=== REG-087 APPLICATION BOUNDARY FAILURE TEST VERIFIED ==='
  );
}

runFailureTests();

