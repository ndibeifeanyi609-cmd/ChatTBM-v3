const { ForecastEvaluationAlignments, isValidObservedResult } = require("./ForecastEvaluation");
const EVALUATION_RECORD_TYPE = "evaluation";
const EVALUATION_RECORD_VERSION = "1.0";
const EvaluationRecordStatuses = Object.freeze({
    CREATED: "created",
    COMPLETED: "completed"
});

function isValidEvaluationStatus(status) {
    return Object.values(
        EvaluationRecordStatuses
    ).includes(status);
}

function createEvaluationRecord({
    id,
    forecastId,
    userId,
    observed,
    alignment,
    status = EvaluationRecordStatuses.CREATED,
    createdAt,
    updatedAt
} = {}) {
    if (
        typeof forecastId !== "string" ||
        !forecastId.trim()
    ) {
        throw new Error("forecastId is required.");
    }

    if (
        typeof observed !== "string" ||
        !isValidObservedResult(observed)
    ) {
        throw new Error("Invalid observed result.");
    }

    if (
        typeof alignment !== "string" ||
        !Object.values(
            ForecastEvaluationAlignments
        ).includes(alignment)
    ) {
        throw new Error("Invalid evaluation alignment.");
    }

    if (!isValidEvaluationStatus(status)) {
        throw new Error("Invalid evaluation status.");
    }

    const timestamp =
        createdAt || new Date().toISOString();

    return Object.freeze({
        id:
            typeof id === "string" && id.trim()
                ? id.trim()
                : `evaluation-${Date.now()}`,

        version: EVALUATION_RECORD_VERSION,

        type: EVALUATION_RECORD_TYPE,

        forecastId: forecastId.trim(),

        userId:
            typeof userId === "string" && userId.trim()
                ? userId.trim()
                : "guest",

        observed,

        alignment,

        status,

        createdAt: timestamp,

        updatedAt: updatedAt || timestamp
    });
}

function isCanonicalEvaluationRecord(record) {
    if (!record || typeof record !== "object") {
        return false;
    }

    return (
        typeof record.id === "string" &&
        record.id.trim() !== "" &&
        record.version === EVALUATION_RECORD_VERSION &&
        record.type === EVALUATION_RECORD_TYPE &&
        typeof record.forecastId === "string" &&
        record.forecastId.trim() !== "" &&
        typeof record.userId === "string" &&
        record.userId.trim() !== "" &&
        isValidObservedResult(record.observed) &&
        Object.values(
            ForecastEvaluationAlignments
        ).includes(record.alignment) &&
        isValidEvaluationStatus(record.status) &&
        typeof record.createdAt === "string" &&
        typeof record.updatedAt === "string"
    );
}

module.exports = {
    EVALUATION_RECORD_TYPE,
    EVALUATION_RECORD_VERSION,
    EvaluationRecordStatuses,
    isValidEvaluationStatus,
    createEvaluationRecord,
    isCanonicalEvaluationRecord
};
