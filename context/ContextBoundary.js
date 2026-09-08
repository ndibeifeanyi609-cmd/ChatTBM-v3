'use strict';

const crypto = require('crypto');

const {
  createContextObject
} = require('./ContextObject');

const {
  saveContext,
  getContext
} = require('./ContextPersistence');

function createContextId(userId) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${Date.now()}:${Math.random()}`)
    .digest('hex');
}

function createContext({
  userId,
  value = {}
} = {}) {
  try {
    const context = createContextObject({
      id: createContextId(userId),
      userId,
      value
    });

    const saved = saveContext(context);

    if (!saved.success) {
      return saved;
    }

    return {
      success: true,
      context: saved.context
    };
  } catch (error) {
    return {
      success: false,
      context: null,
      error: error.message
    };
  }
}

function resolveContext(id, userId) {
  const result = getContext(id);

  if (!result.success) {
    return result;
  }

  if (result.context.userId !== userId) {
    return {
      success: false,
      context: null,
      error: 'Context ownership violation.'
    };
  }

  return {
    success: true,
    context: result.context
  };
}

module.exports = {
  createContext,
  getContext: resolveContext
};

function updateContext(id, userId, {
  expectedVersion,
  changes = {}
} = {}) {
  const resolved = resolveContext(id, userId);

  if (!resolved.success) {
    return resolved;
  }

  if (!Number.isInteger(expectedVersion)) {
    return {
      success: false,
      context: resolved.context,
      error: 'Expected context version is required.'
    };
  }

  if (resolved.context.version !== expectedVersion) {
    return {
      success: false,
      context: resolved.context,
      code: 'CONTEXT_CONFLICT'
    };
  }

  const nextContext = {
    ...resolved.context,
    ...changes,
    id: resolved.context.id,
    userId: resolved.context.userId,
    version: resolved.context.version + 1,
    updatedAt: new Date().toISOString()
  };

  const saved = saveContext(nextContext);

  if (!saved.success) {
    return saved;
  }

  return {
    success: true,
    context: saved.context
  };
}

module.exports.updateContext = updateContext;
