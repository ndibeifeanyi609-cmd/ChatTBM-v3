const {
    isCanonicalEvaluationRecord
} = require("./EvaluationRecord");

const evaluations = new Map();

function saveEvaluation(evaluation) {
    if (!isCanonicalEvaluationRecord(evaluation)) {
        return {
            success: false,
            evaluation: null,
            error: "Invalid canonical evaluation."
        };
    }

    const existing =
        evaluations.get(evaluation.id);

    if (existing) {
        if (
            JSON.stringify(existing) ===
            JSON.stringify(evaluation)
        ) {
            return {
                success: true,
                evaluation: existing,
                idempotent: true
            };
        }

        return {
            success: false,
            evaluation: existing,
            idempotent: false,
            error: "Evaluation ID already exists."
        };
    }

    evaluations.set(
        evaluation.id,
        evaluation
    );

    return {
        success: true,
        evaluation,
        idempotent: false
    };
}

function getEvaluation(id) {
    return evaluations.get(id) || null;
}

function getEvaluationsByUser(userId) {
    return [
        ...evaluations.values()
    ].filter(
        evaluation =>
            evaluation.userId === userId
    );
}

function deleteEvaluation(id) {
    return evaluations.delete(id);
}

function clearEvaluations() {
    evaluations.clear();
}

module.exports = {
    saveEvaluation,
    getEvaluation,
    getEvaluationsByUser,
    deleteEvaluation,
    clearEvaluations
};
