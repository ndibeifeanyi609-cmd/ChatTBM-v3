'use strict';

// =====================================
// ChatTBM V7.0
// REG-087 Learning Application
//
// Application Persistence
//
// Responsibility:
// - Create deterministic application identity
// - Persist canonical ApplicationRecords
// - Enforce idempotency
// - Support legitimate lifecycle updates
// - Detect identity conflicts
// - Retrieve persisted applications
//
// Does NOT:
// - Execute applications
// - Mutate Learning objects
// - Implement target consumer logic
// =====================================

const crypto = require('crypto');

const applicationStore = new Map();

function createApplicationKey(application) {
  if (!application || typeof application !== 'object') {
    throw new Error('Application must be an object');
  }

  const identity = [
    application.userId ?? null,
    application.learningId ?? null,
    application.targetType ?? null,
    application.targetId ?? null,
    application.operation ?? null
  ];

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(identity))
    .digest('hex');
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

function applicationRecordsAreEquivalent(existing, incoming) {
  return JSON.stringify(existing) === JSON.stringify(incoming);
}

function saveApplication(application) {
  if (!application || typeof application !== 'object') {
    throw new Error('Application must be an object');
  }

  const key = createApplicationKey(application);
  const existing = applicationStore.get(key);

  if (!existing) {
    const stored = {
      ...application,
      id: application.id ?? key
    };

    applicationStore.set(key, stored);

    return {
      application: { ...stored },
      created: true,
      updated: false,
      idempotent: false,
      conflict: false
    };
  }

  if (!identitiesAreEquivalent(existing, application)) {
    return {
      application: { ...existing },
      created: false,
      updated: false,
      idempotent: false,
      conflict: true
    };
  }

  if (applicationRecordsAreEquivalent(existing, application)) {
    return {
      application: { ...existing },
      created: false,
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

  applicationStore.set(key, updated);

  return {
    application: { ...updated },
    created: false,
    updated: true,
    idempotent: false,
    conflict: false
  };
}

function getApplication(applicationKey) {
  if (!applicationKey) {
    throw new Error('Application key is required');
  }

  const application = applicationStore.get(applicationKey);

  return application ? { ...application } : null;
}

function hasApplication(applicationKey) {
  if (!applicationKey) {
    throw new Error('Application key is required');
  }

  return applicationStore.has(applicationKey);
}

function clearApplications() {
  applicationStore.clear();
}

module.exports = {
  createApplicationKey,
  getApplicationIdentity,
  identitiesAreEquivalent,
  applicationRecordsAreEquivalent,
  saveApplication,
  getApplication,
  hasApplication,
  clearApplications
};
