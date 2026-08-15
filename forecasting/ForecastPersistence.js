const forecasts = new Map();

function saveForecast(forecast) {
    if (!forecast || !forecast.id) {
        return { success: false, forecast: null };
    }
    forecasts.set(forecast.id, forecast);
    return { success: true, forecast };
}

function getForecast(id) {
    return forecasts.get(id) || null;
}

function getForecastsByUser(userId) {
    return [...forecasts.values()]
        .filter(forecast => forecast.userId === userId);
}

function deleteForecast(id) {
    return forecasts.delete(id);
}

function clearForecasts() {
    forecasts.clear();
}

module.exports = {
    saveForecast,
    getForecast,
    getForecastsByUser,
    deleteForecast,
    clearForecasts
};
