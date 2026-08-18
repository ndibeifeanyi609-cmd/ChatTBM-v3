const {
    ForecastRegistry
} = require("./ForecastRegistry");

// =====================================
// ChatTBM REG-087
// Evaluation / Forecast Integration Boundary
//
// Purpose:
// - Validate canonical Evaluation records
// - Resolve referenced Forecasts through the
//   canonical Forecast Registry
// - Enforce Evaluation/Forecast ownership
// - Preserve Forecast Registry authority
//
// This boundary does NOT:
// - create forecasts
// - update forecasts
// - delete forecasts
// - persist evaluations
// - bypass ForecastRegistry
// - bypass EvaluationRegistry
// =====================================

function registerEvaluation(
    evaluation,
    registry
) {
    if (!evaluation) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Evaluation is required."
        };
    }

    const forecastRegistry =
        registry instanceof ForecastRegistry
            ? registry
            : null;

    if (!forecastRegistry) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error:
                "Forecast Registry dependency is required."
        };
    }

    const forecast =
        forecastRegistry.getById(
            evaluation.forecastId
        );

    if (!forecast) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Forecast not found."
        };
    }

    if (
        forecast.userId !==
        evaluation.userId
    ) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error:
                "Evaluation ownership does not match forecast ownership."
        };
    }

    if (
        forecast.id !==
        evaluation.forecastId
    ) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error:
                "Evaluation forecast reference mismatch."
        };
    }

    return {
        success: true,
        evaluation,
        forecast
    };
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    registerEvaluation
};
