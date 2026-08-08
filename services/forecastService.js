// =====================================
// ChatTBM REG-086.39
// Forecast Service
//
// Purpose:
// - Orchestrate forecasting workflow
// - Connect Prediction Engine to Forecast Registry
// - Create canonical Forecast Objects
// - Validate forecast integrity
// - Register forecasts safely
// - Keep prediction logic separate
// =====================================

const {
    predictContent
} = require("./predictionEngine");

const {
    createForecastObject
} = require("../forecasting/ForecastObject");

const {
    validateForecast
} = require("../forecasting/ForecastValidator");

const {
    ForecastRegistry
} = require("../forecasting/ForecastRegistry");

// =====================================
// FORECAST SERVICE
// =====================================

class ForecastService {

    constructor(options = {}) {

        this.registry =
            options.registry ||
            new ForecastRegistry();

    }

    // =====================================
    // CREATE FORECAST
    // =====================================

    createForecast({

        userId = "guest",

        content = "",

        context = null,

        type = "CONTENT"

    } = {}) {

        // =================================
        // PREDICTION ENGINE
        // =================================

        const prediction =
            predictContent(
                content
            );

        // =================================
        // CANONICAL FORECAST OBJECT
        // =================================

        const forecast =
            createForecastObject({

                userId,

                type,

                input: {

                    content,

                    context

                },

                prediction: {

                    value:
                        prediction.level,

                    score:
                        prediction.score,

                    confidence:
                        null

                },

                signals:
                    prediction.analysis?.signals ||
                    [],

                provenance: {

                    source:
                        "ChatTBM",

                    engine:
                        "predictionEngine",

                    provider:
                        null

                }

            });

        // =================================
        // VALIDATE
        // =================================

        const validation =
            validateForecast(
                forecast
            );

        if (!validation.valid) {

            return {

                success: false,

                stage:
                    "validation",

                error:
                    "Forecast validation failed.",

                validation,

                forecast

            };

        }

        // =================================
        // REGISTER
        // =================================

        const registration =
            this.registry.register(
                forecast
            );

        if (!registration.success) {

            return {

                success: false,

                stage:
                    "registration",

                ...registration

            };

        }

        // =================================
        // RESULT
        // =================================

        return {

            success: true,

            stage:
                "registered",

            forecast:
                registration.forecast,

            prediction,

            registered:
                registration.registered,

            idempotent:
                registration.idempotent

        };

    }

    // =====================================
    // GET FORECAST
    // =====================================

    getForecast(id) {

        return this.registry.getById(
            id
        );

    }

    // =====================================
    // GET USER FORECASTS
    // =====================================

    getUserForecasts(userId) {

        return this.registry.getByUser(
            userId
        );

    }

    // =====================================
    // GET FORECASTS BY TYPE
    // =====================================

    getForecastsByType(type) {

        return this.registry.getByType(
            type
        );

    }

    // =====================================
    // COUNT
    // =====================================

    count() {

        return this.registry.count();

    }

}


// =====================================
// DEFAULT SERVICE
// =====================================

const forecastService =
    new ForecastService();


// =====================================
// EXPORTS
// =====================================

module.exports = {

    ForecastService,

    forecastService

};
