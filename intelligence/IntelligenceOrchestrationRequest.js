'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Canonical Orchestration Request
// =====================================

const INTELLIGENCE_ORCHESTRATION_REQUEST_VERSION = '1.0';

function validateOrchestrationRequest(data = {}) {
    if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
    ) {
        throw new Error(
            'Intelligence orchestration request must be an object.'
        );
    }

    if (
        typeof data.userId !== 'string' ||
        data.userId.trim() === ''
    ) {
        throw new Error(
            'Intelligence orchestration userId is required.'
        );
    }

    if (
        typeof data.operationId !== 'string' ||
        data.operationId.trim() === ''
    ) {
        throw new Error(
            'Intelligence orchestration operationId is required.'
        );
    }

    if (
        data.input === undefined ||
        data.input === null ||
        typeof data.input !== 'object' ||
        Array.isArray(data.input)
    ) {
        throw new Error(
            'Intelligence orchestration input is required.'
        );
    }

    return {
        userId: data.userId.trim(),
        operationId: data.operationId.trim(),
        input: { ...data.input }
    };
}

function createOrchestrationRequest(data = {}) {
    const request = validateOrchestrationRequest(data);

    return {
        version:
            INTELLIGENCE_ORCHESTRATION_REQUEST_VERSION,
        userId: request.userId,
        operationId: request.operationId,
        input: { ...request.input }
    };
}

module.exports = {
    INTELLIGENCE_ORCHESTRATION_REQUEST_VERSION,
    validateOrchestrationRequest,
    createOrchestrationRequest
};
