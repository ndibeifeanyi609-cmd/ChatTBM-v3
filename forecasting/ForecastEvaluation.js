const ForecastObservedResults = Object.freeze({
    VIRAL: "viral",
    HIGH: "high",
    LOW: "low",
    UNKNOWN: "unknown"
});

const ForecastEvaluationAlignments = Object.freeze({
    ALIGNED: "aligned",
    MISMATCH: "mismatch",
    UNKNOWN: "unknown"
});

function isValidObservedResult(result) {
    return Object.values(
        ForecastObservedResults
    ).includes(result);
}

function evaluatePrediction(predictedLevel, actualResult) {
    if (
        typeof predictedLevel !== "string" ||
        !isValidObservedResult(actualResult)
    ) {
        return {
            success: false,
            comparison: null,
            error: "Invalid prediction or observed result."
        };
    }

    if (actualResult === ForecastObservedResults.UNKNOWN) {
        return {
            success: true,
            comparison: {
                predictedLevel,
                actualResult,
                alignment:
                    ForecastEvaluationAlignments.UNKNOWN
            }
        };
    }

    const predicted = predictedLevel.toLowerCase();

    const actualIsHigh =
        actualResult === ForecastObservedResults.VIRAL ||
        actualResult === ForecastObservedResults.HIGH;

    const actualIsLow =
        actualResult === ForecastObservedResults.LOW;

    const aligned =
        (predicted === "high" && actualIsHigh) ||
        (predicted === "low" && actualIsLow);

    return {
        success: true,
        comparison: {
            predictedLevel,
            actualResult,
            alignment:
                aligned
                    ? ForecastEvaluationAlignments.ALIGNED
                    : ForecastEvaluationAlignments.MISMATCH
        }
    };
}

module.exports = {
    ForecastObservedResults,
    ForecastEvaluationAlignments,
    isValidObservedResult,
    evaluatePrediction
};
