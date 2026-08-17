const {
    integrateLearning
} = require("../learning/LearningIntegration");

// =====================================
// ChatTBM REG-087
// Learning Boundary
//
// Purpose:
// - Translate legacy learning signals
//   into canonical Learning input
// - Preserve source/provenance
// - Delegate canonical creation and
//   persistence to LearningIntegration
//
// Boundary:
// Legacy Learning Services
//        ↓
// LearningBoundary
//        ↓
// LearningIntegration
//        ↓
// Canonical Learning Foundation
//
// This boundary does NOT:
// - own persistence
// - own lifecycle transitions
// - bypass LearningRegistry
// - bypass LearningPersistence
// - replace legacy learning engines
// =====================================

// =====================================
// ALLOWED LEGACY SOURCES
// =====================================

const LEGACY_SOURCES = Object.freeze([
    "learningEngine",
    "creatorLearningEngine",
    "performanceLearningEngine",
    "profileLearningBridge"
]);

// =====================================
// CANONICAL TYPE MAPPING
// =====================================

const CANONICAL_TYPES = Object.freeze([
    "preference",
    "behavior",
    "pattern",
    "performance",
    "strategy",
    "knowledge"
]);

// =====================================
// VALIDATE SOURCE
// =====================================

function isValidSource(source) {

    return (
        typeof source === "string" &&
        LEGACY_SOURCES.includes(source)
    );

}

// =====================================
// VALIDATE CANONICAL TYPE
// =====================================

function isValidType(type) {

    return (
        typeof type === "string" &&
        CANONICAL_TYPES.includes(type)
    );

}

// =====================================
// CREATE CANONICAL BOUNDARY INPUT
// =====================================

function createBoundaryInput(data = {}) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return {
            success: false,
            input: null,
            error: "Learning boundary input is required."
        };
    }

    if (!isValidSource(data.source)) {
        return {
            success: false,
            input: null,
            error: "Unsupported learning source."
        };
    }

    if (!isValidType(data.type)) {
        return {
            success: false,
            input: null,
            error: "Invalid canonical learning type."
        };
    }

    return {
        success: true,

        input: {

            type: data.type,

            userId:
                data.userId ||
                "guest",

            subject:
                data.subject ??
                null,

            input:
                data.input &&
                typeof data.input === "object" &&
                !Array.isArray(data.input)
                    ? data.input
                    : {},

            learning:
                data.learning ??
                null,

            evidence:
                Array.isArray(data.evidence)
                    ? data.evidence
                    : [],

            confidence:
                data.confidence,

            lifecycle:
                data.lifecycle,

            provenance: {

                sourceType:
                    data.source,

                sourceId:
                    data.sourceId ||
                    null,

                sourceVersion:
                    data.sourceVersion ||
                    null

            },

            evaluationRefs:
                Array.isArray(data.evaluationRefs)
                    ? data.evaluationRefs
                    : []

        }

    };

}

// =====================================
// INTEGRATE LEGACY LEARNING
// =====================================

function integrateLegacyLearning(data = {}) {

    const prepared =
        createBoundaryInput(data);

    if (!prepared.success) {
        return {
            success: false,
            learning: null,


            error: prepared.error
        };
    }

    return integrateLearning(
        prepared.input
    );

}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    LEGACY_SOURCES,
    CANONICAL_TYPES,
    isValidSource,
    isValidType,
    createBoundaryInput,
    integrateLegacyLearning
};
