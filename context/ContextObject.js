'use strict';

const CONTEXT_VERSION = '1.0';

function createContextObject({
  id,
  userId,
  value = {},
  version = 1,
  createdAt = new Date().toISOString(),
  updatedAt = createdAt
} = {}) {
  if (!userId) {
    throw new Error('Context userId is required.');
  }

  return {
    id,
    version,
    schemaVersion: CONTEXT_VERSION,
    userId,
    value,
    createdAt,
    updatedAt
  };
}

module.exports = {
  CONTEXT_VERSION,
  createContextObject
};
