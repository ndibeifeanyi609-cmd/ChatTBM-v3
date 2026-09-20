'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Canonical Transient Orchestration Object
// =====================================

const INTELLIGENCE_ORCHESTRATION_OBJECT_VERSION = '1.0';

function createIntelligenceOrchestrationObject(
    data = {}
) {
    if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
    ) {
        throw new Error(
            'Intelligence orchestration object data must be an object.'
        );
    }

    const userId =
        typeof data.userId === 'string'
            ? data.userId.trim()
            : '';

    const operationId =
        typeof data.operationId === 'string'
            ? data.operationId.trim()
            : '';

    if (!userId) {
        throw new Error(
            'Intelligence orchestration userId is required.'
        );
    }

    if (!operationId) {
        throw new Error(
            'Intelligence orchestration operationId is required.'
        );
    }

    const now = new Date().toISOString();

    const object = {
        id:
            data.id ||
            createIntelligenceOrchestrationId(),

        version:
            INTELLIGENCE_ORCHESTRATION_OBJECT_VERSION,

        userId,

        operationId,

        input:
            data.input &&
            typeof data.input === 'object' &&
            !Array.isArray(data.input)
                ? { ...data.input }
                : {},

        state:
            data.state ||
            'requested',

        availableInformation:
            data.availableInformation &&
            typeof data.availableInformation === 'object' &&
            !Array.isArray(data.availableInformation)
                ? { ...data.availableInformation }
                : {},

        authorizedOperations:
            Array.isArray(data.authorizedOperations)
                ? [...data.authorizedOperations]
                : [],

        composedIntelligence:
            data.composedIntelligence ?? null,

        delegatedExecution:
            data.delegatedExecution ?? null,

        completedExecution:
            data.completedExecution ?? null,

        verifiedResults:
            data.verifiedResults ?? null,

        createdAt:
            data.createdAt ||
            now,

        updatedAt:
            data.updatedAt ||
            now
    };

    return Object.freeze(object);
}

function createIntelligenceOrchestrationId() {
    return (
        'intelligence_orchestration_' +
        Date.now() +
        '_' +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}

function updateIntelligenceOrchestrationObject(
    orchestration,
    updates = {}
) {
    if (
        !orchestration ||
        typeof orchestration !== 'object' ||
        Array.isArray(orchestration)
    ) {
        return null;
    }

    if (
        !updates ||
        typeof updates !== 'object' ||
        Array.isArray(updates)
    ) {
        return null;
    }

    const next = {
        ...orchestration,
        ...updates,
        userId: orchestration.userId,
        operationId: orchestration.operationId,
        updatedAt: new Date().toISOString()
    };

    return Object.freeze(next);
}

module.exports = {
    INTELLIGENCE_ORCHESTRATION_OBJECT_VERSION,
    createIntelligenceOrchestrationObject,
    createIntelligenceOrchestrationId,
    updateIntelligenceOrchestrationObject
};
