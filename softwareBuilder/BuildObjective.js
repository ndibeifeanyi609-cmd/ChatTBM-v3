'use strict';

function createBuildObjective(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_OBJECTIVE',
        message: 'Build objective requires a normalized request.'
      }
    };
  }

  const operationId =
    typeof request.operationId === 'string' && request.operationId.trim()
      ? request.operationId.trim()
      : '';

  const userId =
    typeof request.userId === 'string' && request.userId.trim()
      ? request.userId.trim()
      : '';

  const message =
    typeof request.message === 'string'
      ? request.message.trim()
      : '';

  if (!operationId || !userId || !message) {
    return {
      valid: false,
      error: {
        code: 'INVALID_OBJECTIVE',
        message: 'Build objective requires operation identity, user identity, and message.'
      }
    };
  }

  return {
    valid: true,
    objective: {
      id: `build-objective:${operationId}`,
      operationId,
      userId,
      intent: message,
      status: 'proposed'
    }
  };
}

module.exports = {
  createBuildObjective
};
