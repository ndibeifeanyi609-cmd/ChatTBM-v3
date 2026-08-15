const {
    isCanonicalEvaluationRecord
} = require("./EvaluationRecord");

const {
    registerEvaluation
} = require("./EvaluationIntegration");

const {
    saveEvaluation,
    getEvaluation,
    getEvaluationsByUser,
    deleteEvaluation
} = require("./EvaluationPersistence");

function registerEvaluationRecord(evaluation) {
    if (!isCanonicalEvaluationRecord(evaluation)) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Invalid canonical evaluation."
        };
    }

    const integration =
        registerEvaluation(evaluation);

    if (!integration.success) {
        return integration;
    }

    return saveEvaluation(evaluation);
}

function getRegisteredEvaluation(id, userId) {
    const evaluation =
        getEvaluation(id);

    if (!evaluation) {
        return {
            success: false,
            evaluation: null,
            error: "Evaluation not found."
        };
    }

    if (
        typeof userId !== "string" ||
        evaluation.userId !== userId
    ) {
        return {
            success: false,
            evaluation: null,
            error: "Evaluation not found."
        };
    }

    return {
        success: true,
        evaluation
    };
}

function getUserEvaluations(userId) {
    return getEvaluationsByUser(userId);
}

function unregisterEvaluation(id) {
    return deleteEvaluation(id);
}

module.exports = {
    registerEvaluationRecord,
    getRegisteredEvaluation,
    getUserEvaluations,
    unregisterEvaluation
};
