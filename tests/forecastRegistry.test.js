// =====================================
// ChatTBM REG-086.41.5
// Forecast Registry Integration Test
//
// Purpose:
// - Verify Forecast Registry integration
// - Verify Persistence Adapter contract
// - Verify canonical forecast validation
// - Verify idempotent registration
// - Verify identity protection
// - Verify lifecycle transitions
// - Verify forecast retrieval
// - Verify forecast updates
// - Verify forecast deletion
// =====================================
const assert = require("assert");
const {
    ForecastTypes
} = require("../forecasting/ForecastTypes");
const {
    createForecastObject
} = require("../forecasting/ForecastObject");
const {
    ForecastRegistry
} = require("../forecasting/ForecastRegistry");
const {
    ForecastLifecycleStates
} = require("../forecasting/ForecastLifecycle");
// =====================================
// TEST HELPERS
// =====================================
function createTestForecast(
    overrides = {}
) {
    return createForecastObject({
        userId:
            "test-user",
        type:
            ForecastTypes.CONTENT,
        input: {
            content:
                "Nobody expected this growth.",
            context:
                {
                    source:
                        "integration-test"
                }
        },
        prediction: {
            value:
                "High",
            score:
                85,
            confidence:
                0.9,
            reasons: [
                "Strong hook detected",
                "Emotional connection"
            ]
        },
        signals: [
            "Curiosity",
            "Growth"
        ],
        provenance: {
            source:
                "ChatTBM",
            engine:
                "predictionEngine",
            provider:
                null
        },
        ...overrides
    });
}
// =====================================
// TEST SUITE
// =====================================
function runForecastRegistryTests() {
    console.log(
        "\n===================================="
    );
    console.log(
        "REG-086.41.5"
    );
    console.log(
        "Forecast Registry Integration Test"
    );
    console.log(
        "====================================\n"
    );
    // =================================
    // REGISTRY
    // =================================
    const registry =
        new ForecastRegistry();
    // =================================
    // TEST 1
    // CREATE FORECAST
    // =================================
    const forecast =
        createTestForecast();
    assert.ok(
        forecast.id,
        "Forecast should have an ID."
    );
    assert.strictEqual(
        forecast.type,
        ForecastTypes.CONTENT,
        "Forecast type should be CONTENT."
    );
    assert.strictEqual(
        forecast.prediction.score,
        85,
        "Prediction score should be preserved."
    );
    assert.deepStrictEqual(
        forecast.prediction.reasons,
        [
            "Strong hook detected",
            "Emotional connection"
        ],
        "Prediction reasons should be preserved."
    );
    console.log(
        "✓ Forecast object creation"
    );
    // =================================
    // TEST 2
    // REGISTER
    // =================================
    const registration =
        registry.register(
            forecast
        );
    assert.strictEqual(
        registration.success,
        true,
        "Forecast should register successfully."
    );
    assert.strictEqual(
        registration.registered,
        true,
        "Forecast should be newly registered."
    );
    assert.strictEqual(
        registration.idempotent,
        false,
        "Initial registration should not be idempotent."
    );
    console.log(
        "✓ Forecast registration"
    );
    // =================================
    // TEST 3
    // EXISTS
    // =================================
    assert.strictEqual(
        registry.exists(
            forecast.id
        ),
        true,
        "Registered forecast should exist."
    );
    console.log(
        "✓ Forecast existence"
    );
    // =================================
    // TEST 4
    // GET BY ID
    // =================================
    const stored =
        registry.getById(
            forecast.id
        );
    assert.ok(
        stored,
        "Stored forecast should be retrievable."
    );
    assert.strictEqual(
        stored.id,
        forecast.id
    );
    assert.strictEqual(
        stored.userId,
        "test-user"
    );
    console.log(
        "✓ Forecast lookup by ID"
    );
    // =================================
    // TEST 5
    // PERSISTENCE ISOLATION
    // =================================
    stored.prediction.score = 1;
    const isolated =
        registry.getById(
            forecast.id
        );
    assert.strictEqual(
        isolated.prediction.score,
        85,
        "Stored forecast must be isolated from returned object mutation."
    );
    console.log(
        "✓ Persistence reference isolation"
    );
    // =================================
    // TEST 6
    // IDEMPOTENT REGISTRATION
    // =================================
    const equivalentForecast = {
        ...forecast,
        createdAt:
            "different-timestamp",
        updatedAt:
            "different-timestamp"
    };
    const idempotent =
        registry.register(
            equivalentForecast
        );
    assert.strictEqual(
        idempotent.success,
        true
    );
    assert.strictEqual(
        idempotent.idempotent,
        true,
        "Equivalent registration should be idempotent."
    );
    console.log(
        "✓ Idempotent registration"
    );
    // =================================
    // TEST 7
    // ID CONFLICT
    // =================================
    const conflictingForecast =
        createTestForecast({
            id:
                forecast.id,
            prediction: {
                value:
                    "Low",
                score:
                    20,
                confidence:
                    0.2,
                reasons: [
                    "Weak signal"
                ]
            }
        });
    const conflict =
        registry.register(
            conflictingForecast
        );
    assert.strictEqual(
        conflict.success,
        false
    );
    assert.strictEqual(
        conflict.code,
        "FORECAST_ID_CONFLICT"
    );
    console.log(
        "✓ Forecast identity conflict protection"
    );
    // =================================
    // TEST 8
    // GET BY USER
    // =================================
    const userForecasts =
        registry.getByUser(
            "test-user"
        );
    assert.strictEqual(
        userForecasts.length,
        1
    );
    console.log(
        "✓ Forecast lookup by user"
    );
    // =================================
    // TEST 9
    // GET BY TYPE
    // =================================
    const contentForecasts =
        registry.getByType(
            ForecastTypes.CONTENT
        );
    assert.strictEqual(
        contentForecasts.length,
        1
    );
    console.log(
        "✓ Forecast lookup by type"
    );
    // =================================
    // TEST 10
    // UPDATE
    // =================================
    const updateResult =
        registry.update(
            forecast.id,
            {
                prediction: {
                    value:
                        "High",
                    score:
                        90,
                    confidence:
                        0.95,
                    reasons: [
                        "Strong hook detected",
                        "Improved engagement"
                    ]
                }
            }
        );
    assert.strictEqual(
        updateResult.success,
        true
    );
    assert.strictEqual(
        updateResult.forecast.prediction.score,
        90
    );
    console.log(
        "✓ Forecast update"
    );
    // =================================
    // TEST 11
    // IDENTITY PROTECTION
    // =================================
    const identityUpdate =
        registry.update(
            forecast.id,
            {
                id:
                    "different-id"
            }
        );
    assert.strictEqual(
        identityUpdate.success,
        false
    );
    assert.strictEqual(
        identityUpdate.code,
        "FORECAST_UPDATE_INVALID"
    );
    console.log(
        "✓ Forecast identity protection"
    );
    // =================================
    // TEST 12
    // OWNERSHIP PROTECTION
    // =================================
    const ownershipUpdate =
        registry.update(
            forecast.id,
            {
                userId:
                    "different-user"
            }
        );
    assert.strictEqual(
        ownershipUpdate.success,
        false
    );
    assert.strictEqual(
        ownershipUpdate.code,
        "FORECAST_UPDATE_INVALID"
    );
    console.log(
        "✓ Forecast ownership protection"
    );
    // =================================
    // TEST 13
    // LIFECYCLE PROTECTION
    // =================================
    const lifecycleUpdate =
        registry.update(
            forecast.id,
            {
                status:
                    ForecastLifecycleStates.COMPLETED
            }
        );
    assert.strictEqual(
        lifecycleUpdate.success,
        false
    );
    assert.strictEqual(
        lifecycleUpdate.code,
        "FORECAST_LIFECYCLE_INVALID"
    );
    console.log(
        "✓ Lifecycle protection"
    );
    // =================================
    // TEST 14
    // LIFECYCLE TRANSITION
    // =================================
    const transitionValidated =
        registry.transition(
            forecast.id,
            ForecastLifecycleStates.VALIDATED
        );
    assert.strictEqual(
        transitionValidated.success,
        true
    );
    assert.strictEqual(
        transitionValidated.previousState,
        ForecastLifecycleStates.CREATED
    );
    assert.strictEqual(
        transitionValidated.currentState,
        ForecastLifecycleStates.VALIDATED
    );
    console.log(
        "✓ Lifecycle transition"
    );
    // =================================
    // TEST 15
    // INVALID LIFECYCLE TRANSITION
    // =================================
    const invalidTransition =
        registry.transition(
            forecast.id,
            ForecastLifecycleStates.LEARNED
        );
    assert.strictEqual(
        invalidTransition.success,
        false
    );
    assert.strictEqual(
        invalidTransition.code,
        "FORECAST_LIFECYCLE_INVALID"
    );
    console.log(
        "✓ Invalid lifecycle transition protection"
    );
    // =================================
    // TEST 16
    // COUNT
    // =================================
    assert.strictEqual(
        registry.count(),
        1
    );
    console.log(
        "✓ Registry count"
    );
    // =================================
    // TEST 17
    // DELETE
    // =================================
    const deletion =
        registry.delete(
            forecast.id
        );
    assert.strictEqual(
        deletion.success,
        true
    );
    assert.strictEqual(
        registry.exists(
            forecast.id
        ),
        false
    );
    console.log(
        "✓ Forecast deletion"
    );
    // =================================
    // TEST 18
    // CLEAR
    // =================================
    registry.clear();
    assert.strictEqual(
        registry.count(),
        0
    );
    console.log(
        "✓ Registry clear"
    );
    // =================================
    // COMPLETE
    // =================================
    console.log(
        "\n===================================="
    );
    console.log(
        "REG-086.41.5 VERIFIED"
    );
    console.log(
        "All Forecast Registry integration tests passed."
    );
    console.log(
        "====================================\n"
    );
}
// =====================================
// RUN
// =====================================
try {
    runForecastRegistryTests();
}
catch (error) {
    console.error(
        "\nREG-086.41.5 FAILED"
    );
    console.error(
        error.message
    );
    process.exitCode = 1;
}
