// =====================================
// ChatTBM REG-086.40
// Forecast Routes
//
// Purpose:
// - Expose forecasting API
// - Connect HTTP route to Forecast Controller
// - Keep forecasting logic outside route layer
// =====================================

const express = require("express");

const router = express.Router();

const {
    createForecastHandler
} = require("../controllers/forecastController");

// =====================================
// CREATE FORECAST
// =====================================

router.post(
    "/",
    createForecastHandler
);

// =====================================
// EXPORT
// =====================================

module.exports = router;
