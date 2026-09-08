'use strict';

const contexts = new Map();

function saveContext(context) {
  if (!context || !context.id) {
    return {
      success: false,
      context: null,
      error: 'Context object with id is required.'
    };
  }

  contexts.set(context.id, context);

  return {
    success: true,
    context
  };
}

function getContext(id) {
  if (!id || !contexts.has(id)) {
    return {
      success: false,
      context: null,
      error: 'Context not found.'
    };
  }

  return {
    success: true,
    context: contexts.get(id)
  };
}

function deleteContext(id) {
  if (!id || !contexts.has(id)) {
    return {
      success: false,
      context: null,
      error: 'Context not found.'
    };
  }

  const context = contexts.get(id);
  contexts.delete(id);

  return {
    success: true,
    context
  };
}

function clearContexts() {
  contexts.clear();

  return {
    success: true
  };
}

module.exports = {
  saveContext,
  getContext,
  deleteContext,
  clearContexts
};
