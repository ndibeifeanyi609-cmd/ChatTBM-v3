const { predictContent } = require("../services/predictionEngine");
const { ForecastTypes } = require("./ForecastTypes");
const { createLifecycleForecast } = require("./ForecastLifecycle");
const {
    registerForecast,
    getRegisteredForecast,
    getUserForecasts,
    updateForecast
} = require("./ForecastRegistry");

function forecastContent(content, userId = "guest") {
    const result = predictContent(content);

    const forecast = createLifecycleForecast({
        userId,
        type: ForecastTypes.CONTENT,
        input: { content },
        prediction: {
            value: result.level,
            score: result.score,
            reasons: result.reasons
        },
        signals: result.analysis?.signals || [],
        provenance: {
            source: "ChatTBM",
            engine: "predictionEngine"
        }
    });

    return registerForecast(forecast);
}

function getForecast(id, userId) {
    return getRegisteredForecast(id, userId);
}

function getForecastsByUser(userId = "guest") {
    return getUserForecasts(userId);
}

function updateRegisteredForecast(forecast) {
    return updateForecast(forecast);
}

module.exports = {
    forecastContent,
    getForecast,
    getForecastsByUser,
    updateRegisteredForecast
};
