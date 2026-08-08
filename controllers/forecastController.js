// =====================================
// ChatTBM REG-086.40
// Forecast Controller
//
// Purpose:
// - Receive forecast requests
// - Validate API input
// - Call Forecast Service
// - Translate service results to HTTP
// - Keep registry mechanics outside controller
// =====================================

const {
    forecastService
} = require("../services/forecastService");

const {
    isValidForecastType
} = require("../forecasting/ForecastTypes");

// =====================================
// CREATE FORECAST
// =====================================

async function createForecastHandler(
    req,
    res
) {

    try {

        const {

            message,

            userId = "guest",

            type = "CONTENT",

            context = null

        } = req.body || {};

        // ===============================
        // REQUEST VALIDATION
        // ===============================

        if (
            !message ||
            typeof message !== "string" ||
            message.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "FORECAST_REQUEST_INVALID",

                message:
                    "Forecast message is required."

            });

        }

        // ===============================
        // USER ID VALIDATION
        // ===============================

        if (
            typeof userId !== "string" ||
            userId.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "FORECAST_REQUEST_INVALID",

                message:
                    "Forecast userId must be a valid string."

            });

        }

        // ===============================
        // TYPE VALIDATION
        // ===============================

        if (
            !isValidForecastType(type)
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "FORECAST_TYPE_INVALID",

                message:
                    `Invalid forecast type: ${type}`

            });

        }

        // ===============================
        // FORECAST SERVICE
        // ===============================

        const result =
            forecastService.createForecast({

                userId:
                    userId.trim(),

                content:
                    message.trim(),

                context,

                type

            });

        // ===============================
        // SERVICE FAILURE
        // ===============================

        if (!result.success) {

            if (
                result.stage ===
                "validation"
            ) {

                return res.status(422).json({

                    success: false,

                    code:
                        "FORECAST_INVALID",

                    message:
                        result.error,

                    validation:
                        result.validation

                });

            }

            if (
                result.stage ===
                "registration"
            ) {

                if (
                    result.code ===
                    "FORECAST_ID_CONFLICT"
                ) {

                    return res.status(409).json({

                        success: false,

                        code:
                            result.code,

                        message:
                            result.error

                    });

                }

                return res.status(500).json({

                    success: false,

                    code:
                        result.code ||
                        "FORECAST_REGISTRATION_FAILED",

                    message:
                        result.error

                });

            }

            return res.status(500).json({

                success: false,

                code:
                    "FORECAST_FAILED",

                message:
                    result.error ||
                    "Unable to create forecast."

            });

        }

        // ===============================
        // SUCCESS
        // ===============================

        return res.status(201).json({

            success: true,

            version:
                "1.0",

            forecast:
                result.forecast

        });

    }

    catch (error) {

        console.error(
            "Forecast Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            code:
                "FORECAST_INTERNAL_ERROR",

            message:
                "Unable to process forecast request.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

}

// =====================================
// EXPORTS
// =====================================

module.exports = {

    createForecastHandler

};
