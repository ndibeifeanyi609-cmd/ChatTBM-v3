const {
    createLearningObject
} = require("./LearningObject");

const {
    registerLearning,
    updateLearning
} = require("./LearningRegistry");

const {
    getLearning
} = require("./LearningPersistence");

const {
    isValidLearningType
} = require("./LearningTypes");

// =====================================
// CANONICAL COMPARISON
// =====================================

function areSameLearning(a, b) {

    if (!a || !b) {
        return false;
    }

    const normalize = learning => {

        const {
            createdAt,
            updatedAt,
            ...semanticLearning
        } = learning;

        return semanticLearning;
    };

    return (
        JSON.stringify(normalize(a)) ===
        JSON.stringify(normalize(b))
    );
}

// =====================================
// CREATE CANONICAL LEARNING
// =====================================

function createCanonicalLearning(data = {}) {

    if (!data || typeof data !== "object") {
        return {
            success: false,
            learning: null,
            error: "Learning input is required."
        };
    }

    if (!isValidLearningType(data.type)) {
        return {
            success: false,
            learning: null,
            error: "Invalid learning type."
        };
    }

    const learning =
        createLearningObject(data);

    return {
        success: true,
        learning
    };
}

// =====================================
// INTEGRATE LEARNING
// =====================================

function integrateLearning(data = {}) {

    const created =
        createCanonicalLearning(data);

    if (!created.success) {
        return created;
    }

    const learning =
        created.learning;

    const existing =
        getLearning(learning.id);

    if (existing) {

        if (areSameLearning(existing, learning)) {
            return {
                success: true,
                learning: existing,
                idempotent: true
            };
        }

        return registerLearning(learning);
    }

    return registerLearning(learning);
}

// =====================================
// UPDATE LEARNING
// =====================================

function updateIntegratedLearning(
    learning
) {

    if (
        !learning ||
        typeof learning !== "object"
    ) {
        return {
            success: false,
            learning: null,
            error: "Learning input is required."
        };
    }

    return updateLearning(learning);
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    createCanonicalLearning,
    integrateLearning,
    updateIntegratedLearning
};
