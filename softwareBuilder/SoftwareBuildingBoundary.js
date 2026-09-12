'use strict';

function validateBuildAccess(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_BOUNDARY_REQUEST',
        message: 'Software-building boundary requires a valid request.'
      }
    };
  }

  const userId =
    typeof request.userId === 'string' && request.userId.trim()
      ? request.userId.trim()
      : '';

  if (!userId) {
    return {
      valid: false,
      error: {
        code: 'UNAUTHORIZED_OPERATION',
        message: 'Software-building operation requires user identity.'
      }
    };
  }

  return {
    valid: true,
    access: {
      userId,
      authorized: true
    }
  };
}

function authorizeOperation(request, operation) {
  const accessResult = validateBuildAccess(request);

  if (!accessResult.valid) {
    return accessResult;
  }

  if (typeof operation !== 'string' || !operation.trim()) {
    return {
      valid: false,
      error: {
        code: 'INVALID_OPERATION',
        message: 'Software-building operation is required.'
      }
    };
  }

  return {
    valid: false,
    error: {
      code: 'UNSUPPORTED_OPERATION',
      message: 'No consequential software-building execution operation is approved.'
    }
  };
}

module.exports = {
  validateBuildAccess,
  authorizeOperation
};
