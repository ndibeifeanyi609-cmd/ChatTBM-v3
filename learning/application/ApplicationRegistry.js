'use strict';

// =====================================
// ChatTBM V7.0
// REG-087 Learning Application
//
// Application Registry
//
// Responsibility:
// - Validate canonical ApplicationRecords
// - Register valid application records
// - Support legitimate lifecycle updates
// - Provide canonical application lookup
//
// Does NOT:
// - Execute applications
// - Mutate Learning objects
// - Own persistence identity generation
// - Implement target consumer logic
// =====================================

const {
  APPLICATION_STATES,
  isApplicationState
} = require('./ApplicationLifecycle');

const registry = new Map();

const REQUIRED_FIELDS = [
  'id',
  'version',
  'learningId',
  'userId',
  'targetType',
  'targetId',
  'operation',
  'status',
  'createdAt',
  'updatedAt'
];

function validateApplication(application) {
  if (
    !application ||
    typeof application !== 'object' ||
    Array.isArray(application)
  ) {
    throw new Error('Application must be an object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (
      application[field] === undefined ||
      application[field] === null ||
      application[field] === ''
    ) {
      throw new Error(`Missing required application field: ${field}`);
    }
  }

  if (application.version !== '1.0') {
    throw new Error(
      `Unsupported application version: ${application.version}`
    );
  }

  if (!isApplicationState(application.status)) {
    throw new Error(
      `Invalid application status: ${application.status}`
    );
  }

  return true;
}

function getApplicationIdentity(application) {
  return [
    application.userId ?? null,
    application.learningId ?? null,
    application.targetType ?? null,
    application.targetId ?? null,
    application.operation ?? null
  ];
}

function identitiesAreEquivalent(existing, incoming) {
  return JSON.stringify(
    getApplicationIdentity(existing)
  ) === JSON.stringify(
    getApplicationIdentity(incoming)
  );
}

function recordsAreEquivalent(existing, incoming) {
  return JSON.stringify(existing) === JSON.stringify(incoming);
}

function registerApplication(application) {
  validateApplication(application);

  const existing = registry.get(application.id);

  if (!existing) {
    const stored = { ...application };

    registry.set(application.id, stored);

    return {
      application: { ...stored },
      registered: true,
      updated: false,
      idempotent: false,
      conflict: false
    };
  }

  if (!identitiesAreEquivalent(existing, application)) {
    return {
      application: { ...existing },
      registered: false,
      updated: false,
      idempotent: false,
      conflict: true
    };
  }

  if (recordsAreEquivalent(existing, application)) {
    return {
      application: { ...existing },
      registered: false,
      updated: false,
      idempotent: true,
      conflict: false
    };
  }

  const updated = {
    ...existing,
    ...application,
    id: existing.id
  };

  registry.set(application.id, updated);

  return {
    application: { ...updated },
    registered: false,
    updated: true,
    idempotent: false,
    conflict: false
  };
}

function getApplication(applicationId) {
  if (!applicationId) {
    throw new Error('Application ID is required');
  }

  const application = registry.get(applicationId);

  return application ? { ...application } : null;
}

function hasApplication(applicationId) {
  if (!applicationId) {
    throw new Error('Application ID is required');
  }

  return registry.has(applicationId);
}

function clearRegistry() {
  registry.clear();
}

module.exports = {
  APPLICATION_STATES,
  REQUIRED_FIELDS,
  validateApplication,
  getApplicationIdentity,
  identitiesAreEquivalent,
  registerApplication,
  getApplication,
  hasApplication,
  clearRegistry
};
