// =====================================
// ChatTBM
// Gemini Provider Test
//
// Purpose:
// - Verify Gemini provider construction
// - Verify request validation
// - Verify missing API key protection
// - Verify provider contract
// - Never call Gemini without credentials
// =====================================

const assert = require("assert");

const {
    GeminiProvider
} = require("../services/GeminiProvider");

// =====================================
// TEST SUITE
// =====================================

async function runTests() {

    console.log(
        "\n=== GEMINI PROVIDER TEST ===\n"
    );

    const provider =
        new GeminiProvider({
            apiKey: null
        });

    // =================================
    // TEST 1
    // PROVIDER CONSTRUCTION
    // =================================

    assert.strictEqual(
        provider.name,
        "gemini"
    );

    assert.strictEqual(
        provider.model,
        "gemini-2.5-flash"
    );

    console.log(
        "✓ Gemini provider construction"
    );

    // =================================
    // TEST 2
    // INVALID REQUEST
    // =================================

    const invalid =
        await provider.generateResponse({
            message: ""
        });

    assert.strictEqual(
        invalid.success,
        false
    );

    assert.strictEqual(
        invalid.error.code,
        "INVALID_REQUEST"
    );

    console.log(
        "✓ Invalid request protection"
    );

    // =================================
    // TEST 3
    // MISSING API KEY
    // =================================

    const unavailable =
        await provider.generateResponse({
            message:
                "Explain photosynthesis.",
            userId:
                "test-user"
        });

    assert.strictEqual(
        unavailable.success,
        false
    );

    assert.strictEqual(
        unavailable.provider,
        "gemini"
    );

    assert.strictEqual(
        unavailable.error.code,
        "PROVIDER_UNAVAILABLE"
    );

    assert.ok(
        unavailable.error.message
            .toLowerCase()
            .includes("api key")
    );

    console.log(
        "✓ Missing API key protection"
    );

    // =================================
    // COMPLETE
    // =================================

    console.log(
        "\n=== GEMINI PROVIDER VERIFIED ===\n"
    );
}

// =====================================
// RUN
// =====================================

runTests().catch(error => {

    console.error(
        "\n=== GEMINI PROVIDER FAILED ==="
    );

    console.error(
        error.message
    );

    process.exitCode = 1;

});
