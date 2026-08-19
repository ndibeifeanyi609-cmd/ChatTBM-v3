'use strict';

// =====================================
// ChatTBM V7.0
// REG-087 Learning Application
//
// Application Object
//
// Responsibility:
// - Define the canonical ApplicationRecord
// - Normalize application input
// - Enforce required application fields
// - Establish the initial REQUESTED state
//
// Does NOT:
// - Execute applications
// - Persist applications
// - Mutate Learning objects
// - Access downstream target internals
// =====================================

const APPLICATION_VERSION = '1.0';

const REQUIRED_FIELDS = [
  'learningId',
  'targetType',
  'targetId',
  'operation'
];

function normalizeUserId(userId) {
  if (userId === undefined || userId === null || userId === '') {
    return 'guest';
  }

  return String(userId);
}

function requireField(data, field) {
  if (
    data[field] === undefined ||
    data[field] === null ||
    data[field] === ''
  ) {
    throw new Error(`Missing required application field: ${field}`);
  }
}

function normalizeOptionalObject(value, field) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid application ${field}`);
  }

  return { ...value };
}

function createApplicationObject(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Application data must be an object');
  }

  for (const field of REQUIRED_FIELDS) {
    requireField(data, field);
  }

  const now = new Date().toISOString();

  return {
    id: data.id ?? null,
    version: APPLICATION_VERSION,
    learningId: String(data.learningId),
    userId: normalizeUserId(data.userId),
    targetType: String(data.targetType),
    targetId: String(data.targetId),
    operation: String(data.operation),
    status: 'REQUESTED',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    ...(data.error !== undefined
      ? { error: normalizeOptionalObject(data.error, 'error') }
      : {}),
    ...(data.metadata !== undefined
      ? { metadata: normalizeOptionalObject(data.metadata, 'metadata') }
      : {})
  };
}

module.exports = {
  APPLICATION_VERSION,
  REQUIRED_FIELDS,
  normalizeUserId,
  createApplicationObject
};
