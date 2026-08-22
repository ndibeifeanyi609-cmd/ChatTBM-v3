'use strict';

const assert = require('assert');

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
  registerApplication,
  clearRegistry
} = require('../learning/application/ApplicationRegistry');

const {
  applyLearning
} = require('../learning/application/LearningApplicationBoundary');

function runTests() {
  console.log('\n=== REG-087 APPLICATION BOUNDARY TEST ===\n');

  clearApplications();
  clearRegistry();


  // =====================================
  // CANONICAL PERSISTENCE / IDEMPOTENCY
  // =====================================

  const application = createApplicationObject({
    learningId: 'learning-test-001',
    userId: 'guest',
    targetType: 'profile',
    targetId: 'profile-test-001',
    operation: 'apply-learning'
  });

  const key = createApplicationKey(application);

  const first = saveApplication(application);

  assert.strictEqual(first.created, true);
  assert.strictEqual(first.updated, false);
  assert.strictEqual(first.idempotent, false);
  assert.strictEqual(first.conflict, false);

  const second = saveApplication({
    ...application
  });

  assert.strictEqual(second.created, false);
  assert.strictEqual(second.updated, false);
  assert.strictEqual(second.idempotent, true);
  assert.strictEqual(second.conflict, false);

  assert.deepStrictEqual(
    second.application,
    first.application
  );

  assert.deepStrictEqual(
    getApplication(key),
    first.application
  );

  console.log('✓ Canonical persistence and idempotency');


  // =====================================
  // REGISTRY IDENTITY CONFLICT
  // =====================================

  clearRegistry();

  const registryFirst = {
    id: 'application-conflict-test-001',
    version: '1.0',
    learningId: 'learning-001',
    userId: 'guest',
    targetType: 'profile',
    targetId: 'profile-001',
    operation: 'apply-learning',
    status: 'REQUESTED',
    createdAt: '2026-08-22T19:00:00.000Z',
    updatedAt: '2026-08-22T19:00:00.000Z'
  };

  const conflicting = {
    ...registryFirst,
    learningId: 'learning-002'
  };

  const registered = registerApplication(registryFirst);

  assert.strictEqual(registered.registered, true);
  assert.strictEqual(registered.conflict, false);

  const conflict = registerApplication(conflicting);

  assert.strictEqual(conflict.registered, false);
  assert.strictEqual(conflict.updated, false);
  assert.strictEqual(conflict.idempotent, false);
  assert.strictEqual(conflict.conflict, true);

  assert.deepStrictEqual(
    conflict.application,
    registryFirst
  );

  console.log('✓ Registry identity conflict protection');


  // =====================================
  // TERMINAL APPLIED NO RE-EXECUTION
  // =====================================

  clearApplications();
  clearRegistry();

  const terminalLearning = {
    id: 'learning-terminal-test-001',
    userId: 'guest',
    type: 'preference',
    subject: 'response-style',
    learning: 'Prefer concise responses'
  };

  let executionCount = 0;

  const successfulConsumer = {
    apply({ learning, application }) {
      executionCount += 1;

      assert.strictEqual(
        learning.id,
        terminalLearning.id
      );

      assert.strictEqual(
        application.status,
        'REQUESTED'
      );

      return {
        success: true
      };
    }
  };

  const appliedFirst = applyLearning({
    learning: terminalLearning,
    targetType: 'profile',
    targetId: 'profile-terminal-test-001',
    operation: 'apply-learning',
    targetConsumer: successfulConsumer
  });

  assert.strictEqual(appliedFirst.success, true);
  assert.strictEqual(
    appliedFirst.application.status,
    'APPLIED'
  );
  assert.strictEqual(executionCount, 1);

  const appliedSecond = applyLearning({
    learning: terminalLearning,
    targetType: 'profile',
    targetId: 'profile-terminal-test-001',
    operation: 'apply-learning',
    targetConsumer: successfulConsumer
  });

  assert.strictEqual(appliedSecond.success, true);
  assert.strictEqual(
    appliedSecond.application.status,
    'APPLIED'
  );

  assert.strictEqual(executionCount, 1);

  assert.deepStrictEqual(
    appliedSecond.application,
    appliedFirst.application
  );

  console.log('✓ APPLIED terminal state prevents re-execution');


  // =====================================
  // CONSUMER FAILURE
  // =====================================

  clearApplications();
  clearRegistry();

  const failureLearning = {
    id: 'learning-failure-test-001',
    userId: 'guest',
    type: 'preference',
    subject: 'response-style',
    learning: 'Prefer concise responses'
  };

  let failureExecutionCount = 0;

  const failingConsumer = {
    apply() {
      failureExecutionCount += 1;

      throw new Error(
        'Simulated target consumer failure'
      );
    }
  };

  const failedFirst = applyLearning({
    learning: failureLearning,
    targetType: 'profile',
    targetId: 'profile-failure-test-001',
    operation: 'apply-learning',
    targetConsumer: failingConsumer
  });

  assert.strictEqual(
    failedFirst.success,
    false
  );

  assert.strictEqual(
    failedFirst.application.status,
    'FAILED'
  );

  assert.strictEqual(
    failureExecutionCount,
    1
  );

  assert.ok(
    failedFirst.application.error
  );

  assert.strictEqual(
    failedFirst.application.error.message,
    'Simulated target consumer failure'
  );

  console.log('✓ Consumer failure becomes controlled FAILED state');


  // =====================================
  // FAILED TERMINAL NO RE-EXECUTION
  // =====================================

  let shouldFail = true;

  const recoverableConsumer = {
    apply() {
      failureExecutionCount += 1;

      if (shouldFail) {
        throw new Error(
          'Initial application failure'
        );
      }

      return {
        success: true
      };
    }
  };

  // Clear canonical state before the dedicated
  // terminal FAILED verification.
  clearApplications();
  clearRegistry();

  const failedTerminalFirst = applyLearning({
    learning: {
      id: 'learning-failed-terminal-test-001',
      userId: 'guest',
      type: 'preference',
      subject: 'response-style',
      learning: 'Prefer concise responses'
    },
    targetType: 'profile',
    targetId: 'profile-failed-terminal-test-001',
    operation: 'apply-learning',
    targetConsumer: recoverableConsumer
  });

  assert.strictEqual(
    failedTerminalFirst.success,
    false
  );

  assert.strictEqual(
    failedTerminalFirst.application.status,
    'FAILED'
  );

  assert.strictEqual(
    failureExecutionCount,
    2
  );

  shouldFail = false;

  const failedTerminalSecond = applyLearning({
    learning: {
      id: 'learning-failed-terminal-test-001',
      userId: 'guest',
      type: 'preference',
      subject: 'response-style',
      learning: 'Prefer concise responses'
    },
    targetType: 'profile',
    targetId: 'profile-failed-terminal-test-001',
    operation: 'apply-learning',
    targetConsumer: recoverableConsumer
  });

  assert.strictEqual(
    failedTerminalSecond.success,
    false
  );

  assert.strictEqual(
    failedTerminalSecond.application.status,
    'FAILED'
  );

  assert.strictEqual(
    failureExecutionCount,
    2
  );

  assert.deepStrictEqual(
    failedTerminalSecond.application,
    failedTerminalFirst.application
  );

  console.log(
    '✓ FAILED terminal state prevents re-execution'
  );

  // =====================================
  // INVALID BOUNDARY INPUT
  // =====================================

  clearApplications();
  clearRegistry();

  let invalidExecutionCount = 0;

  const validConsumer = {
    apply() {
      invalidExecutionCount += 1;

      return {
        success: true
      };
    }
  };

  assert.throws(
    () => applyLearning(null),
    /Application boundary input must be an object/
  );

  assert.throws(
    () => applyLearning({
      targetType: 'profile',
      targetId: 'profile-invalid-test-001',
      operation: 'apply-learning',
      targetConsumer: validConsumer
    }),
    /Learning object is required/
  );

  assert.throws(
    () => applyLearning({
      learning: {
        id: 'learning-invalid-test-001',
        userId: 'guest'
      },
      targetType: 'profile',
      targetId: 'profile-invalid-test-001',
      operation: 'apply-learning'
    }),
    /Target consumer is required/
  );

  assert.throws(
    () => applyLearning({
      learning: {
        id: 'learning-invalid-test-002',
        userId: 'guest'
      },
      targetType: 'profile',
      targetId: 'profile-invalid-test-002',
      operation: 'apply-learning',
      targetConsumer: {}
    }),
    /Target consumer must implement apply/
  );

  assert.strictEqual(
    invalidExecutionCount,
    0
  );

  console.log(
    '✓ Invalid boundary inputs are rejected before execution'
  );

  // =====================================
  // BOUNDARY REGISTRY CONFLICT
  // =====================================

  clearApplications();
  clearRegistry();

  const conflictLearning = {
    id: 'learning-boundary-conflict-001',
    userId: 'guest',
    type: 'preference',
    subject: 'response-style',
    learning: 'Prefer concise responses'
  };

  const conflictApplication =
    createApplicationObject({
      learningId: conflictLearning.id,
      userId: conflictLearning.userId,
      targetType: 'profile',
      targetId: 'profile-boundary-conflict-001',
      operation: 'apply-learning'
    });


  const conflictKey =
    createApplicationKey(conflictApplication);

  const conflictingRecord = {
    ...conflictApplication,
    id: conflictKey,
    learningId: 'different-learning-identity-001'
  };

  const seededConflict =
    registerApplication(conflictingRecord);

  assert.strictEqual(
    seededConflict.registered,
    true
  );

  assert.strictEqual(
    seededConflict.conflict,
    false
  );

  let conflictExecutionCount = 0;

  const conflictConsumer = {
    apply() {
      conflictExecutionCount += 1;

      return {
        success: true
      };
    }
  };

  assert.throws(
    () => applyLearning({
      learning: conflictLearning,
      targetType: 'profile',
      targetId: 'profile-boundary-conflict-001',
      operation: 'apply-learning',
      targetConsumer: conflictConsumer
    }),
    /Application registry conflict/
  );

  assert.strictEqual(
    conflictExecutionCount,
    0
  );

  console.log(
    '✓ Boundary rejects registry identity conflict'
  );

  console.log(
    '\n=== REG-087 APPLICATION BOUNDARY VERIFIED ==='
  );
}

runTests();
