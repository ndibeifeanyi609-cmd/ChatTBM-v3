const {
    getRegisteredEvaluation
} = require("../forecasting/EvaluationRegistry");

// =====================================
// ChatTBM REG-087
// Learning / Evaluation Reference Boundary
//
// Purpose:
// - Validate Learning evaluation references
// - Resolve references through the canonical
//   Evaluation Registry
// - Enforce Learning/Evaluation ownership
// - Preserve Evaluation authority
//
// This boundary does NOT:
// - create evaluations
// - update evaluations
// - delete evaluations
// - persist learning
// - bypass EvaluationRegistry
// - bypass LearningRegistry
// =====================================

// =====================================
// VALIDATE EVALUATION REFERENCES
// =====================================

function validateEvaluationReferences(
    learning
) {

    if (
        !learning ||
        typeof learning !== "object" ||
        Array.isArray(learning)
    ) {
        return {
            success: false,
            learning: null,
            evaluations: [],
            error: "Learning input is required."
        };
    }

    const userId =
        typeof learning.userId === "string" &&
        learning.userId.trim()
            ? learning.userId.trim()
            : "guest";

    const evaluationRefs =
        Array.isArray(learning.evaluationRefs)
            ? learning.evaluationRefs
            : [];

    const uniqueRefs = [
        ...new Set(
            evaluationRefs
                .filter(
                    ref =>
                        typeof ref === "string"
                )
                .map(
                    ref => ref.trim()
                )
                .filter(
                    ref => ref !== ""
                )
        )
    ];

    const evaluations = [];

    for (const evaluationId of uniqueRefs) {

        const result =
            getRegisteredEvaluation(
                evaluationId.trim(),
                userId
            );

        if (
            !result ||
            !result.success ||
            !result.evaluation
        ) {
            return {
                success: false,
                learning: null,
                evaluations: [],
                error:
                    "Evaluation reference is invalid or unauthorized."
            };
        }

        evaluations.push(
            result.evaluation
        );
    }

    return {
        success: true,
        learning: {
            ...learning,
            userId,
            evaluationRefs: uniqueRefs
        },
        evaluations
    };
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    validateEvaluationReferences
};
