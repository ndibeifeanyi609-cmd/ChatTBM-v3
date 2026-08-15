// =====================================
// ChatTBM REG-086.38.9
// Forecast Registry Verification
//
// Purpose:
// - Verify canonical forecast creation
// - Verify forecast validation
// - Verify registry registration
// - Verify idempotent registration
// - Verify identity protection
// - Verify ownership protection
// - Verify lifecycle enforcement
// - Verify persistence isolation
// - Verify lookup operations
// - Verify deletion and clearing
//
// IMPORTANT:
// - Verification only
// - No production integration
// - No API dependency
// - No memory/intelligence dependency
// =====================================

const {
    createForecastObject
} = require("./ForecastObject");

const {
    validateForecast
} = require("./ForecastValidator");

const {
    ForecastLifecycleStates
} = require("./ForecastLifecycle");

const {
    ForecastRegistry
} = require("./ForecastRegistry");


// =====================================
// VERIFICATION STATE
// =====================================

const verification = {

    passed: 0,

    failed: 0,

    results: []

};


// =====================================
// ASSERTION
// =====================================

function assert(
    name,
    condition
) {

    if (condition) {

        verification.passed++;

        verification.results.push({

            name,

            status: "PASS"

        });

    }

    else {

        verification.failed++;

        verification.results.push({

            name,

            status: "FAIL"

        });

    }

}


// =====================================
// CREATE REGISTRY
// =====================================

function createRegistry() {

    return new ForecastRegistry();

}


// =====================================
// RUN VERIFICATION
// =====================================

function runForecastRegistryVerification() {

    verification.passed = 0;

    verification.failed = 0;

    verification.results = [];


    const registry =
        createRegistry();


    // =================================
    // CREATE FORECAST
    // =================================

    const forecast =
        createForecastObject({

            id:
                "verification_forecast_001",

            userId:
                "verification_user_001",

            type:
                "CONTENT",

            input: {

                content:
                    "Verification content",

                context:
                    "Registry verification"

            },

            prediction: {

                value:
                    "High",

                score:
                    85,

                confidence:
                    0.9

            },

            signals: [

                "hook",

                "emotion"

            ],

            provenance: {

                source:
                    "Verification",

                engine:
                    "ForecastRegistryVerification",

                provider:
                    null

            }

        });


    assert(

        "Forecast object created",

        Boolean(
            forecast &&
            forecast.id
        )

    );


    // =================================
    // VALIDATE FORECAST
    // =================================

    const validation =
        validateForecast(
            forecast
        );


    assert(

        "Forecast validation succeeds",

        validation.valid === true

    );


    // =================================
    // REGISTER
    // =================================

    const registration =
        registry.register(
            forecast
        );


    assert(

        "Forecast registration succeeds",

        registration.success === true &&
        registration.registered === true

    );


    assert(

        "Registry contains forecast",

        registry.exists(
            forecast.id
        ) === true

    );


    // =================================
    // GET BY ID
    // =================================

    const retrieved =
        registry.getById(
            forecast.id
        );


    assert(

        "Forecast lookup by ID succeeds",

        retrieved &&
        retrieved.id === forecast.id

    );


    // =================================
    // GET BY USER
    // =================================

    const userForecasts =
        registry.getByUser(
            forecast.userId
        );


    assert(

        "Forecast lookup by user succeeds",

        userForecasts.length === 1 &&

        userForecasts[0].id ===
            forecast.id

    );


    // =================================
    // GET BY TYPE
    // =================================

    const typeForecasts =
        registry.getByType(
            forecast.type
        );


    assert(

        "Forecast lookup by type succeeds",

        typeForecasts.length === 1 &&

        typeForecasts[0].id ===
            forecast.id

    );


    // =================================
    // IDEMPOTENT REGISTRATION
    // =================================

    const duplicate =
        registry.register(
            forecast
        );


    assert(

        "Duplicate registration is idempotent",

        duplicate.success === true &&

        duplicate.idempotent === true &&

        duplicate.registered === false

    );


    // =================================
    // ID CONFLICT
    // =================================

    const conflictingForecast =
        createForecastObject({

            id:
                forecast.id,

            userId:
                forecast.userId,

            type:
                "AUDIENCE",

            input: {

                content:
                    "Conflicting forecast"

            }

        });


    const conflict =
        registry.register(
            conflictingForecast
        );


    assert(

        "Forecast ID conflict is rejected",

        conflict.success === false &&

        conflict.code ===
            "FORECAST_ID_CONFLICT"

    );


    // =================================
    // SAFE UPDATE
    // =================================

    const update =
        registry.update(

            forecast.id,

            {

                prediction: {

                    value:
                        "Very High",

                    score:
                        95,

                    confidence:
                        0.95

                }

            }

        );


    assert(

        "Normal forecast update succeeds",

        update.success === true &&

        update.forecast.prediction.score ===
            95

    );


    // =================================
    // ID PROTECTION
    // =================================

    const idUpdate =
        registry.update(

            forecast.id,

            {

                id:
                    "different_id"

            }

        );


    assert(

        "Forecast ID cannot be changed",

        idUpdate.success === false &&

        idUpdate.code ===
            "FORECAST_UPDATE_INVALID"

    );


    // =================================
    // USER OWNERSHIP PROTECTION
    // =================================

    const userUpdate =
        registry.update(

            forecast.id,

            {

                userId:
                    "different_user"

            }

        );


    assert(

        "Forecast userId cannot be changed",

        userUpdate.success === false &&

        userUpdate.code ===
            "FORECAST_UPDATE_INVALID"

    );


    // =================================
    // LIFECYCLE PROTECTION
    // =================================

    const lifecycleUpdate =
        registry.update(

            forecast.id,

            {

                status:
                    ForecastLifecycleStates
                        .COMPLETED

            }

        );


    assert(

        "Lifecycle cannot bypass transition()",

        lifecycleUpdate.success === false &&

        lifecycleUpdate.code ===
            "FORECAST_LIFECYCLE_INVALID"

    );


    // =================================
    // VALID LIFECYCLE TRANSITION
    // =================================

    const validated =
        registry.transition(

            forecast.id,

            ForecastLifecycleStates
                .VALIDATED

        );


    assert(

        "Valid lifecycle transition succeeds",

        validated.success === true &&

        validated.currentState ===
            ForecastLifecycleStates.VALIDATED

    );


    // =================================
    // INVALID LIFECYCLE TRANSITION
    // =================================

    const invalidTransition =
        registry.transition(

            forecast.id,

            ForecastLifecycleStates
                .LEARNED

        );


    assert(

        "Invalid lifecycle transition is rejected",

        invalidTransition.success === false &&

        invalidTransition.code ===
            "FORECAST_LIFECYCLE_INVALID"

    );


    // =================================
    // PERSISTENCE ISOLATION
    // =================================

    const isolated =
        registry.getById(
            forecast.id
        );


    isolated.input.content =
        "MUTATED OUTSIDE REGISTRY";


    const original =
        registry.getById(
            forecast.id
        );


    assert(

        "Persistence protects stored references",

        original.input.content !==
            "MUTATED OUTSIDE REGISTRY"

    );


    // =================================
    // COUNT
    // =================================

    assert(

        "Registry count is correct",

        registry.count() === 1

    );


    // =================================
    // DELETE
    // =================================

    const deletion =
        registry.delete(
            forecast.id
        );


    assert(

        "Forecast deletion succeeds",

        deletion.success === true &&

        deletion.deleted === true &&

        registry.exists(
            forecast.id
        ) === false

    );


    // =================================
    // CLEAR
    // =================================

    const secondForecast =
        createForecastObject({

            id:
                "verification_forecast_002",

            userId:
                "verification_user_001",

            type:
                "GENERAL"

        });


    registry.register(
        secondForecast
    );


    const clear =
        registry.clear();


    assert(

        "Registry clear succeeds",

        clear.success === true &&

        clear.cleared === true &&

        registry.count() === 0

    );


    // =================================
    // FINAL RESULT
    // =================================

    return {

        success:
            verification.failed === 0,

        passed:
            verification.passed,

        failed:
            verification.failed,

        total:
            verification.results.length,

        results:
            verification.results

    };

}


// =====================================
// EXPORT
// =====================================

module.exports = {

    runForecastRegistryVerification

};
