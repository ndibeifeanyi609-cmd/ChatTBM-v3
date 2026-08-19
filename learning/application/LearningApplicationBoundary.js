'use strict';

// =====================================
// ChatTBM V7.0
// REG-087 Learning Application
//
// Learning Application Boundary
//
// Responsibility:
// - Orchestrate canonical Learning application
// - Create ApplicationRecords
// - Persist application state
// - Register canonical applications
// - Invoke an injected target consumer
// - Apply lifecycle transitions
// - Persist final application state
//
// Does NOT:
// - Mutate Learning objects
// - Own target internals
// - Implement Memory/Profile/Context logic
// - Access external APIs
// =====================================

const {
  createApplicationObject
} = require('./ApplicationObject');

const {
  APPLICATION_STATES,
  transitionApplication
} = require('./ApplicationLifecycle');

const {
  createApplicationKey,
  saveApplication
} = require('./ApplicationPersistence');

const {
  registerApplication
} = require('./ApplicationRegistry');

function validateBoundaryInput(data) {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw new Error('Application boundary input must be an object');
  }

  if (
    !data.learning ||
    typeof data.learning !== 'object' ||
    Array.isArray(data.learning)
  ) {
    throw new Error('Learning object is required');
  }

  if (!data.targetConsumer || typeof data.targetConsumer !== 'object') {
    throw new Error('Target consumer is required');
  }

  if (typeof data.targetConsumer.apply !== 'function') {
    throw new Error('Target consumer must implement apply()');
  }

  return true;
}

function createApplicationInput(data) {
  const learning = data.learning;

  return {
    learningId: learning.id,
    userId: learning.userId,
    targetType: data.targetType,
    targetId: data.targetId,
    operation: data.operation,
    metadata: data.metadata
  };
}

function normalizeConsumerResult(result) {
  if (result === undefined || result === null) {
    return {
      success: true
    };
  }

  if (typeof result !== 'object' || Array.isArray(result)) {
    return {
      success: Boolean(result)
    };
  }

  return {
    success: result.success !== false,
    ...result
  };
}

function applyLearning(data) {
  validateBoundaryInput(data);

  const application = createApplicationObject(
    createApplicationInput(data)
  );

  const persistenceResult = saveApplication(application);

  if (persistenceResult.conflict) {
    throw new Error('Application persistence conflict');
  }

  const persistedApplication = persistenceResult.application;

  const registryResult = registerApplication(
    persistedApplication
  );

  if (registryResult.conflict) {
    throw new Error('Application registry conflict');
  }

  let currentApplication = registryResult.application;

  const applicationKey = createApplicationKey(
    currentApplication
  );

  let consumerResult;

  try {
    consumerResult = normalizeConsumerResult(
      data.targetConsumer.apply({
        learning: { ...data.learning },
        application: { ...currentApplication }
      })
    );
  } catch (error) {
    consumerResult = {
      success: false,
      error: {
        message: error.message
      }
    };
  }

  const nextState = consumerResult.success
    ? APPLICATION_STATES.APPLIED
    : APPLICATION_STATES.FAILED;

  const transitionedState = transitionApplication(
    currentApplication.status,
    nextState
  );

  const finalApplication = {
    ...currentApplication,
    status: transitionedState,
    updatedAt: new Date().toISOString(),
    ...(consumerResult.success
      ? {}
      : { error: consumerResult.error ?? null }),
    ...(consumerResult.metadata !== undefined
      ? { metadata: consumerResult.metadata }
      : {})
  };

  const finalPersistence = saveApplication(finalApplication);

  if (finalPersistence.conflict) {
    throw new Error('Final application persistence conflict');
  }

  currentApplication = finalPersistence.application;

  const finalRegistryResult = registerApplication(
    currentApplication
  );

  if (finalRegistryResult.conflict) {
    throw new Error('Final application registry conflict');
  }

  return {
    application: { ...finalRegistryResult.application },
    applicationKey,
    success:
      finalRegistryResult.application.status ===
      APPLICATION_STATES.APPLIED
  };
}

module.exports = {
  validateBoundaryInput,
  createApplicationInput,
  normalizeConsumerResult,
  applyLearning
};
