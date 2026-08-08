// =====================================
// ChatTBM REG-086.41.4
// Forecast Object
//
// Purpose:
// - Canonical forecasting object
// - Standardize forecast records
// - Provide safe defaults
// - Preserve prediction explanations
// - Prepare lifecycle integration
// - Prepare evaluation integration
// - Prepare memory integration
// =====================================
const {
    ForecastTypes,
    isValidForecastType
} = require("./ForecastTypes");
// =====================================
// FORECAST OBJECT VERSION
// =====================================
const FORECAST_OBJECT_VERSION = "1.0";
// =====================================
// CREATE FORECAST OBJECT
// =====================================
function createForecastObject(data = {}) {
    const type =
        isValidForecastType(data.type)
            ? data.type
            : ForecastTypes.GENERAL;
    const now =
        new Date().toISOString();
    return {
        // ===============================
        // IDENTITY
        // ===============================
        id:
            data.id ||
            createForecastId(),
        version:
            FORECAST_OBJECT_VERSION,
        type,
        // ===============================
        // OWNERSHIP
        // ===============================
        userId:
            data.userId ||
            "guest",
        // ===============================
        // INPUT
        // ===============================
        input: {
            content:
                data.input?.content ||
                "",
            context:
                data.input?.context ||
                null
        },
        // ===============================
        // PREDICTION
        // ===============================
        prediction: {
            value:
                data.prediction?.value ||
                null,
            score:
                normalizeScore(
                    data.prediction?.score
                ),
            confidence:
                data.prediction?.confidence ??
                null,
            reasons:
                normalizePredictionReasons(
                    data.prediction?.reasons
                )
        },
        // ===============================
        // SIGNALS
        // ===============================
        signals:
            Array.isArray(data.signals)
                ? data.signals
                : [],
        // ===============================
        // STATUS
        // ===============================
        status:
            data.status ||
            "created",
        // ===============================
        // EVALUATION
        // ===============================
        evaluation:
            data.evaluation ||
            null,
        // ===============================
        // LEARNING
        // ===============================
        learning:
            data.learning ||
            null,
        // ===============================
        // PROVENANCE
        // ===============================
        provenance: {
            source:
                data.provenance?.source ||
                "ChatTBM",
            engine:
                data.provenance?.engine ||
                null,
            provider:
                data.provenance?.provider ||
                null
        },
        // ===============================
        // TIMESTAMPS
        // ===============================
        createdAt:
            data.createdAt ||
            now,
        updatedAt:
            data.updatedAt ||
            now
    };
}
// =====================================
// FORECAST ID
// =====================================
function createForecastId() {
    return (
        "forecast_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}
// =====================================
// NORMALIZE SCORE
// =====================================
function normalizeScore(score) {
    if (
        typeof score !== "number" ||
        Number.isNaN(score)
    ) {
        return null;
    }
    if (score < 0) {
        return 0;
    }
    if (score > 100) {
        return 100;
    }
    return score;
}
// =====================================
// NORMALIZE PREDICTION REASONS
// =====================================
function normalizePredictionReasons(
    reasons
) {
    if (!Array.isArray(reasons)) {
        return [];
    }
    return reasons.filter(
        reason =>
            typeof reason === "string"
    );
}
// =====================================
// VALIDATE FORECAST OBJECT
// =====================================
function validateForecastObject(
    forecast
) {
    if (!forecast) {
        return {
            valid: false,
            errors: [
                "Forecast object is required."
            ]
        };
    }
    const errors = [];
    if (!forecast.id) {
        errors.push(
            "Forecast ID is required."
        );
    }
    if (
        !isValidForecastType(
            forecast.type
        )
    ) {
        errors.push(
            "Invalid forecast type."
        );
    }
    if (!forecast.userId) {
        errors.push(
            "User ID is required."
        );
    }
    if (!forecast.version) {
        errors.push(
            "Forecast version is required."
        );
    }
    return {
        valid:
            errors.length === 0,
        errors
    };
}
// =====================================
// UPDATE FORECAST
// =====================================
function updateForecastObject(
    forecast,
    updates = {}
) {
    if (!forecast) {
        return null;
    }
    return {
        ...forecast,
        ...updates,
        updatedAt:
            new Date().toISOString()
    };
}
// =====================================
// EXPORTS
// =====================================
module.exports = {
    FORECAST_OBJECT_VERSION,
    createForecastObject,
    validateForecastObject,
    updateForecastObject
};
