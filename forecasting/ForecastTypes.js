// =====================================
// ChatTBM REG-086.34
// Forecast Types Registry
//
// Purpose:
// - Canonical forecasting type definitions
// - Prevent type duplication
// - Provide shared forecasting constants
// - Prepare future registry integration
// =====================================
// =====================================
// FORECAST TYPES
// =====================================
const ForecastTypes = Object.freeze({
    CONTENT:
    "CONTENT",
    AUDIENCE:
    "AUDIENCE",
    CREATOR:
    "CREATOR",
    PERFORMANCE:
    "PERFORMANCE",
    GROWTH:
    "GROWTH",
    STRATEGY:
    "STRATEGY",
    TREND:
    "TREND",
    GENERAL:
    "GENERAL"
});
// =====================================
// TYPE VALIDATION
// =====================================
function isValidForecastType(type) {
    return Object.values(
        ForecastTypes
    ).includes(type);
}
// =====================================
// GET ALL TYPES
// =====================================
function getForecastTypes() {
    return Object.values(
        ForecastTypes
    );
}
// =====================================
// EXPORTS
// =====================================
module.exports = {
    ForecastTypes,
    isValidForecastType,
    getForecastTypes
};
