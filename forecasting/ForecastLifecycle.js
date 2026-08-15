const { createForecastObject } = require("./ForecastObject");

const ForecastLifecycleStates = Object.freeze({
    CREATED: "created",
    VALIDATED: "validated",
    PROCESSING: "processing",
    COMPLETED: "completed",
    EVALUATED: "evaluated",
    LEARNED: "learned",
    FAILED: "failed"
});
const VALID_TRANSITIONS = {
    created: ["validated", "failed"],
    validated: ["processing", "failed"],
    processing: ["completed", "failed"],
    completed: ["evaluated", "failed"],
    evaluated: ["learned", "failed"],
    learned: [],
    failed: ["validated"]
};
function isValidLifecycleState(state) {
    return Object.values(
        ForecastLifecycleStates
    ).includes(state);
}

function canTransition(currentState, nextState) {
    if (!isValidLifecycleState(currentState)) {
        return false;
    }

    if (!isValidLifecycleState(nextState)) {
        return false;
    }

    return (
        VALID_TRANSITIONS[currentState] || []
    ).includes(nextState);
}
function transitionForecast(forecast, nextState) {
    if (!forecast) {
        return {
            success: false,
            forecast: null,
            error: "Forecast object is required."
        };
    }

    const currentState =
        forecast.status ||
        ForecastLifecycleStates.CREATED;

    if (!canTransition(currentState, nextState)) {
        return {
            success: false,
            forecast,
            error:
                `Invalid forecast lifecycle transition: ${currentState} → ${nextState}`
        };
    }

    return {
        success: true,
        forecast: {
            ...forecast,
            status: nextState,
            updatedAt: new Date().toISOString()
        },
        previousState: currentState,
        currentState: nextState
    };
}
function createLifecycleForecast(data = {}) {
    return createForecastObject({
        ...data,
        status: ForecastLifecycleStates.CREATED
    });
}

function getNextStates(state) {
    if (!isValidLifecycleState(state)) {
        return [];
    }

    return [
        ...(VALID_TRANSITIONS[state] || [])
    ];
}

module.exports = {
    ForecastLifecycleStates,
    isValidLifecycleState,
    canTransition,
    transitionForecast,
    createLifecycleForecast,
    getNextStates
};
