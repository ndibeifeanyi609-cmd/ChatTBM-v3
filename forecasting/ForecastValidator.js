// =====================================
// ChatTBM REG-086.36
// Forecast Validator
//
// Purpose:
// - Validate canonical forecast objects
// - Protect forecasting integrity
// - Detect malformed forecast data
// - Validate required fields
// - Validate prediction values
// - Validate lifecycle state
// - Prepare safe registry persistence
// =====================================
const {
    isValidForecastType
} = require("./ForecastTypes");
const {
    isValidLifecycleState
} = require("./ForecastLifecycle");
// =====================================
// VALIDATION RESULT
// =====================================
function validationResult(
    valid,
    errors = [],
    warnings = []
) {
    return {
        valid,
        errors,
        warnings
    };
}
// =====================================
// REQUIRED FIELD VALIDATION
// =====================================
function validateRequiredFields(
    forecast
) {
    const errors = [];
    if (!forecast) {
        errors.push(
            "Forecast object is required."
        );
        return errors;
    }
    if (!forecast.id) {
        errors.push(
            "Forecast ID is required."
        );
    }
    if (!forecast.version) {
        errors.push(
            "Forecast version is required."
        );
    }
    if (!forecast.type) {
        errors.push(
            "Forecast type is required."
        );
    }
    if (!forecast.userId) {
        errors.push(
            "Forecast userId is required."
        );
    }
    if (!forecast.createdAt) {
        errors.push(
            "Forecast createdAt is required."
        );
    }
    return errors;
}
// =====================================
// TYPE VALIDATION
// =====================================
function validateType(
    forecast
) {
    const errors = [];
    if (
        !isValidForecastType(
            forecast.type
        )
    ) {
        errors.push(
            `Invalid forecast type: ${forecast.type}`
        );
    }
    return errors;
}
// =====================================
// LIFECYCLE VALIDATION
// =====================================
function validateLifecycle(
    forecast
) {
    const errors = [];
    if (
        !isValidLifecycleState(
            forecast.status
        )
    ) {
        errors.push(
            `Invalid forecast lifecycle state: ${forecast.status}`
        );
    }
    return errors;
}
// =====================================
// PREDICTION VALIDATION
// =====================================
function validatePrediction(
    forecast
) {
    const errors = [];
    const prediction =
        forecast.prediction;
    if (!prediction) {
        return errors;
    }
    if (
        prediction.score !== null &&
        prediction.score !== undefined
    ) {
        if (
            typeof prediction.score !==
            "number"
        ) {
            errors.push(
                "Prediction score must be a number."
            );
        }
        else if (
            prediction.score < 0 ||
            prediction.score > 100
        ) {
            errors.push(
                "Prediction score must be between 0 and 100."
            );
        }
    }
    return errors;
}
// =====================================
// INPUT VALIDATION
// =====================================
function validateInput(
    forecast
) {
    const errors = [];
    if (
        forecast.input &&
        typeof forecast.input !==
        "object"
    ) {
        errors.push(
            "Forecast input must be an object."
        );
    }
    if (
        forecast.input?.content !== undefined &&
        typeof forecast.input.content !==
        "string"
    ) {
        errors.push(
            "Forecast input content must be a string."
        );
    }
    return errors;
}
// =====================================
// SIGNAL VALIDATION
// =====================================
function validateSignals(
    forecast
) {
    const errors = [];
    if (
        forecast.signals !== undefined &&
        !Array.isArray(
            forecast.signals
        )
    ) {
        errors.push(
            "Forecast signals must be an array."
        );
    }
    return errors;
}
// =====================================
// PROVENANCE VALIDATION
// =====================================
function validateProvenance(
    forecast
) {
    const errors = [];
    if (
        forecast.provenance !== undefined &&
        typeof forecast.provenance !==
        "object"
    ) {
        errors.push(
            "Forecast provenance must be an object."
        );
    }
    return errors;
}
// =====================================
// COMPLETE VALIDATION
// =====================================
function validateForecast(
    forecast
) {
    const errors = [];
    errors.push(
        ...validateRequiredFields(
            forecast
        )
    );
    if (!forecast) {
        return validationResult(
            false,
            errors
        );
    }
    errors.push(
        ...validateType(
            forecast
        )
    );
    errors.push(
        ...validateLifecycle(
            forecast
        )
    );
    errors.push(
        ...validatePrediction(
            forecast
        )
    );
    errors.push(
        ...validateInput(
            forecast
        )
    );
    errors.push(
        ...validateSignals(
            forecast
        )
    );
    errors.push(
        ...validateProvenance(
            forecast
        )
    );
    return validationResult(
        errors.length === 0,
        errors
    );
}
// =====================================
// STRICT VALIDATION
// =====================================
function assertValidForecast(
    forecast
) {
    const result =
        validateForecast(
            forecast
        );
    if (!result.valid) {
        const error =
            new Error(
                "Invalid forecast object."
            );
        error.validation =
            result;
        throw error;
    }
    return forecast;
}
// =====================================
// EXPORTS
// =====================================
module.exports = {
    validateForecast,
    assertValidForecast,
    validateRequiredFields,
    validateType,
    validateLifecycle,
    validatePrediction,
    validateInput,
    validateSignals,
    validateProvenance
};
