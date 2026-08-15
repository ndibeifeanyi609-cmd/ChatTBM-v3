const {
    isCanonicalEvaluationRecord
} = require("./EvaluationRecord");

const {
    getRegisteredForecast
} = require("./ForecastRegistry");

function registerEvaluation(evaluation) {
    if (!isCanonicalEvaluationRecord(evaluation)) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Invalid canonical evaluation."
        };
    }

    const forecastResult =
        getRegisteredForecast(
            evaluation.forecastId,
            evaluation.userId
        );

    if (
        !forecastResult ||
        !forecastResult.success ||
        !forecastResult.forecast
    ) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Forecast not found."
        };
    }

    const forecast =
        forecastResult.forecast;

    if (forecast.userId !== evaluation.userId) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Evaluation ownership does not match forecast ownership."
        };
    }

    if (forecast.id !== evaluation.forecastId) {
        return {
            success: false,
            evaluation: null,
            forecast: null,
            error: "Evaluation forecast reference mismatch."
        };
    }

    return {
        success: true,
        evaluation,
        forecast
    };
}

module.exports = {
    registerEvaluation
};
