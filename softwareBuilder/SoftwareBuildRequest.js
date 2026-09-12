'use strict';

function normalizeUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    return 'guest';
  }

  return userId.trim();
}

function normalizeOperationId(operationId) {
  if (typeof operationId !== 'string' || !operationId.trim()) {
    return '';
  }

  return operationId.trim();
}

function normalizeMessage(message) {
  if (typeof message !== 'string') {
    return '';
  }

  return message.trim();
}

function validateSoftwareBuildRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Software build request must be an object.'
      }
    };
  }

  const operationId = normalizeOperationId(request.operationId);
  const message = normalizeMessage(request.message);

  if (!operationId) {
    return {
      valid: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Software build request operationId is required.'
      }
    };
  }

  if (!message) {
    return {
      valid: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Software build request message is required.'
      }
    };
  }

  return {
    valid: true,
    value: {
      operationId,
      userId: normalizeUserId(request.userId),
      message
    }
  };
}

function createSoftwareBuildRequest(request) {
  const result = validateSoftwareBuildRequest(request);

  if (!result.valid) {
    return result;
  }

  return {
    valid: true,
    request: result.value
  };
}

module.exports = {
  normalizeUserId,
  normalizeOperationId,
  normalizeMessage,
  validateSoftwareBuildRequest,
  createSoftwareBuildRequest
};
