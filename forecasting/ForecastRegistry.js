const {
    saveForecast,
    getForecast,
    getForecastsByUser,
    deleteForecast
} = require("./ForecastPersistence");

const {
    isValidForecastType
} = require("./ForecastTypes");

const {
    isValidLifecycleState,
    canTransition
} = require("./ForecastLifecycle");

function registerForecast(forecast) {
    if (!forecast || !forecast.id) {
        return { success: false, forecast: null, error: "Invalid forecast." };
    }

    if (
        !forecast.version ||
        !forecast.userId ||
        !forecast.status ||
        !isValidLifecycleState(forecast.status) ||
        !isValidForecastType(forecast.type)
    ) {
        return {
            success: false,
            forecast: null,
            error: "Invalid canonical forecast."
        };
    }

    const existing = getForecast(forecast.id);

    if (existing) {
        if (JSON.stringify(existing) === JSON.stringify(forecast)) {
            return { success: true, forecast: existing, idempotent: true };
        }

        return {
            success: false,
            forecast: existing,
            error: "Forecast ID already exists."
        };
    }

    return saveForecast(forecast);
}

function updateForecast(forecast) {
    if (!forecast || !forecast.id) {
        return { success: false, forecast: null, error: "Invalid forecast." };
    }

    const existing = getForecast(forecast.id);

    if (!existing) {
        return { success: false, forecast: null, error: "Forecast not found." };
    }

    if (
        !forecast.version ||
        !forecast.userId ||
        !forecast.status ||
        !isValidLifecycleState(forecast.status) ||
        !isValidForecastType(forecast.type)
    ) {
        return {
            success: false,
            forecast: existing,
            error: "Invalid canonical forecast."
        };
    }

    if (existing.userId !== forecast.userId) {
        return {
            success: false,
            forecast: existing,
            error: "Forecast ownership cannot be changed."
        };
    }

    if (
        existing.status !== forecast.status &&
        !canTransition(existing.status, forecast.status)
    ) {
        return {
            success: false,
            forecast: existing,
            error: "Invalid forecast lifecycle transition."
        };
    }

    return saveForecast(forecast);
}

function getRegisteredForecast(id, userId) {
    const forecast = getForecast(id);

    if (!forecast) {
        return {
            success: false,
            forecast: null,
            error: "Forecast not found."
        };
    }

    if (typeof userId !== "string" || forecast.userId !== userId) {
        return {
            success: false,
            forecast: null,
            error: "Forecast not found."
        };
    }

    return {
        success: true,
        forecast
    };
}

function getUserForecasts(userId) {
    return getForecastsByUser(userId);
}

function unregisterForecast(id) {
    return deleteForecast(id);
}

module.exports = {
    registerForecast,
    updateForecast,
    getRegisteredForecast,
    getUserForecasts,
    unregisterForecast
};
