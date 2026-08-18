const assert = require("assert");

const {
    createForecastObject
} = require("../forecasting/ForecastObject");

const {
    ForecastTypes
} = require("../forecasting/ForecastTypes");

const {
    ForecastRegistry
} = require("../forecasting/ForecastRegistry");

const {
    createEvaluationRecord
} = require("../forecasting/EvaluationRecord");

const {
    registerEvaluationRecord,
    getRegisteredEvaluation
} = require("../forecasting/EvaluationRegistry");

const {
    clearEvaluations
} = require("../forecasting/EvaluationPersistence");

const {
    validateEvaluationReferences
} = require("../services/LearningEvaluationBoundary");

function createForecast(id, userId) {
    return createForecastObject({
        id,
        userId,
        type: ForecastTypes.CONTENT,
        input: {
            content: "Boundary test content"
        },
        prediction: {
            value: "High",
            score: 85,
            confidence: 0.9,
            reasons: [
                "Strong hook"
            ]
        },
        provenance: {
            source: "ChatTBM",
            engine: "test"
        }
    });
}

function createEvaluation(id, forecastId, userId) {
    return createEvaluationRecord({
        id,
        forecastId,
        userId,
        observed: "high",
        alignment: "aligned"
    });
}

function registerForecast(forecast) {
    const registry = new ForecastRegistry();

    const result = registry.register(forecast);

    assert.strictEqual(
        result.success,
        true
    );

    return registry;
}

function runTests() {
    console.log(
        "\n=== LEARNING / EVALUATION BOUNDARY TEST ===\n"
    );

    clearEvaluations();

    const invalid =
        validateEvaluationReferences(null);

    assert.strictEqual(
        invalid.success,
        false
    );

    assert.strictEqual(
        invalid.learning,
        null
    );

    assert.deepStrictEqual(
        invalid.evaluations,
        []
    );

    console.log(
        "✓ Invalid Learning input rejection"
    );

    const empty =
        validateEvaluationReferences({
            userId: "boundary-user",
            evaluationRefs: []
        });

    assert.strictEqual(
        empty.success,
        true
    );

    assert.strictEqual(
        empty.learning.userId,
        "boundary-user"
    );

    assert.deepStrictEqual(
        empty.learning.evaluationRefs,
        []
    );

    assert.deepStrictEqual(
        empty.evaluations,
        []
    );

    console.log(
        "✓ Empty evaluation reference acceptance"
    );

    // =====================================
    // VALID EVALUATION REFERENCE
    // =====================================

    const forecast =
        createForecast(
            "forecast-boundary-001",
            "boundary-user"
        );

    const forecastRegistry =
        registerForecast(forecast);

    const evaluation =
        createEvaluation(
            "evaluation-boundary-001",
            forecast.id,
            "boundary-user"
        );

    const registration =
        registerEvaluationRecord(
            evaluation,
            forecastRegistry
        );

    assert.strictEqual(
        registration.success,
        true
    );

    const valid =
        validateEvaluationReferences({
            userId: "boundary-user",
            subject: "content",
            learning:
                "Strong hooks perform well.",
            evaluationRefs: [
                evaluation.id
            ]
        });

    assert.strictEqual(
        valid.success,
        true
    );

    assert.strictEqual(
        valid.learning.userId,
        "boundary-user"
    );

    assert.deepStrictEqual(
        valid.learning.evaluationRefs,
        [
            evaluation.id
        ]
    );

    assert.strictEqual(
        valid.evaluations.length,
        1
    );

    assert.strictEqual(
        valid.evaluations[0].id,
        evaluation.id
    );

    console.log(
        "✓ Valid evaluation reference resolution"
    );

    // =====================================
    // DUPLICATE REFERENCE NORMALIZATION
    // =====================================

    const duplicateRefs =
        validateEvaluationReferences({
            userId: "boundary-user",
            evaluationRefs: [
                evaluation.id,
                evaluation.id,
                "   " + evaluation.id + "   "
            ]
        });

    assert.strictEqual(
        duplicateRefs.success,
        true
    );

    assert.deepStrictEqual(
        duplicateRefs.learning.evaluationRefs,
        [
            evaluation.id
        ]
    );

    assert.strictEqual(
        duplicateRefs.evaluations.length,
        1
    );

    console.log(
        "✓ Evaluation reference normalization"
    );

    // =====================================
    // UNAUTHORIZED USER REFERENCE
    // =====================================

    const unauthorized =
        validateEvaluationReferences({
            userId: "different-user",
            evaluationRefs: [
                evaluation.id
            ]
        });

    assert.strictEqual(
        unauthorized.success,
        false
    );

    assert.strictEqual(
        unauthorized.learning,
        null
    );

    assert.deepStrictEqual(
        unauthorized.evaluations,
        []
    );

    console.log(
        "✓ Evaluation ownership protection"
    );

    // =====================================
    // MISSING EVALUATION
    // =====================================

    const missing =
        validateEvaluationReferences({
            userId: "boundary-user",
            evaluationRefs: [
                "evaluation-does-not-exist"
            ]
        });

    assert.strictEqual(
        missing.success,
        false
    );

    assert.strictEqual(
        missing.learning,
        null
    );

    assert.deepStrictEqual(
        missing.evaluations,
        []
    );

    console.log(
        "✓ Missing evaluation rejection"
    );

    // =====================================
    // MALFORMED REFERENCE NORMALIZATION
    // =====================================

    const malformed =
        validateEvaluationReferences({
            userId: "boundary-user",
            evaluationRefs: [
                evaluation.id,
                null,
                {},
                123,
                ""
            ]
        });

    assert.strictEqual(
        malformed.success,
        true
    );

    assert.deepStrictEqual(
        malformed.learning.evaluationRefs,
        [
            evaluation.id
        ]
    );

    assert.strictEqual(
        malformed.evaluations.length,
        1
    );

    console.log(
        "✓ Malformed reference filtering"
    );

    // =====================================
    // REGISTRY AUTHORITY
    // =====================================

    const resolved =
        getRegisteredEvaluation(
            evaluation.id,
            "boundary-user"
        );

    assert.strictEqual(
        resolved.success,
        true
    );

    assert.strictEqual(
        resolved.evaluation.id,
        evaluation.id
    );

    assert.strictEqual(
        resolved.evaluation.forecastId,
        forecast.id
    );

    assert.strictEqual(
        resolved.evaluation.userId,
        "boundary-user"
    );

    console.log(
        "✓ Evaluation Registry authority"
    );

    console.log(
        "\n=== ALL LEARNING / EVALUATION BOUNDARY TESTS PASSED ===\n"
    );
}

runTests();
