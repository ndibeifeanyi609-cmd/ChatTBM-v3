// =====================================
// ChatTBM REG-086.35
// Forecast Lifecycle
//
// Purpose:
// - Control forecast state transitions
// - Prevent invalid lifecycle changes
// - Provide safe lifecycle validation
// - Prepare forecasting orchestration
// - Prepare registry integration
// =====================================
const {
    createForecastObject
} = require("./ForecastObject");
// =====================================
// LIFECYCLE STATES
// =====================================
const ForecastLifecycleStates = Object.freeze({
    CREATED:
        "created",
    VALIDATED:
        "validated",
    PROCESSING:
        "processing",
    COMPLETED:
        "completed",
    EVALUATED:
        "evaluated",
    LEARNED:
        "learned",
    FAILED:
        "failed"
});
// =====================================
// VALID TRANSITIONS
// =====================================
const VALID_TRANSITIONS = Object.freeze({
    created: [
        "validated",
        "failed"
    ],
    validated: [
        "processing",
        "failed"
    ],
    processing: [
        "completed",
        "failed"
    ],
    completed: [
        "evaluated",
        "failed"
    ],
    evaluated: [
        "learned",
        "failed"
    ],
    learned: [],
    failed: [
        "validated"
    ]
});
// =====================================
// VALIDATE STATE
// =====================================
function isValidLifecycleState(state) {
    return Object.values(
        ForecastLifecycleStates
    ).includes(state);
}
// =====================================
// CHECK TRANSITION
// =====================================
function canTransition(
    currentState,
    nextState
) {
    if (
        !isValidLifecycleState(
            currentState
        )
    ) {
        return false;
    }
    if (
        !isValidLifecycleState(
            nextState
        )
    ) {
        return false;
    }
    return (
        VALID_TRANSITIONS[
            currentState
        ] || []
    ).includes(
        nextState
    );
}
// =====================================
// TRANSITION FORECAST
// =====================================
function transitionForecast(
    forecast,
    nextState
) {
    if (!forecast) {
        return {
            success: false,
            forecast: null,
            error:
                "Forecast object is required."
        };
    }
    const currentState =
        forecast.status ||
        ForecastLifecycleStates.CREATED;
    if (
        !canTransition(
            currentState,
            nextState
        )
    ) {
        return {
            success: false,
            forecast,
            error:
                `Invalid forecast lifecycle transition: ${currentState} → ${nextState}`
        };
    }
    const updatedForecast = {
        ...forecast,
        status: nextState,
        updatedAt:
            new Date().toISOString()
    };
    return {
        success: true,
        forecast:
            updatedForecast,
        previousState:
            currentState,
        currentState:
            nextState
    };
}
// =====================================
// CREATE LIFECYCLE FORECAST
// =====================================
function createLifecycleForecast(
    data = {}
) {
    const forecast =
        createForecastObject({
            ...data,
            status:
                ForecastLifecycleStates.CREATED
        });
    return forecast;
}
// =====================================
// GET NEXT STATES
// =====================================
function getNextStates(state) {
    if (
        !isValidLifecycleState(
            state
        )
    ) {
        return [];
    }
    return [
        ...(VALID_TRANSITIONS[state] || [])
    ];
}
// =====================================
// GET LIFECYCLE STATUS
// =====================================
function getLifecycleStatus(
    forecast
) {
    if (!forecast) {
        return {
            valid: false,
            state: null,
            nextStates: [],
            error:
                "Forecast object is required."
        };
    }
    const state =
        forecast.status ||
        ForecastLifecycleStates.CREATED;
    return {
        valid:
            isValidLifecycleState(
                state
            ),
        state,
        nextStates:
            getNextStates(state)
    };
}
// =====================================
// EXPORTS
// =====================================
module.exports = {
    ForecastLifecycleStates,
    isValidLifecycleState,
    canTransition,
    transitionForecast,
    createLifecycleForecast,
    getNextStates,
    getLifecycleStatus
};
