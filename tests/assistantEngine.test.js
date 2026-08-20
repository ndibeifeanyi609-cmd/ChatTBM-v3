'use strict';

const assert = require("assert");

const {
    generateReply,
    validateAssistantRequest,
    normalizeUserId,
    normalizeMessage,
    buildAIRequest,
    normalizeAssistantError
} = require("../services/assistantEngine");

async function runTests() {

    console.log("\n=== ASSISTANT ENGINE TEST ===\n");

    // =====================================
    // USER ID NORMALIZATION
    // =====================================

    assert.strictEqual(
        normalizeUserId(),
        "guest"
    );

    assert.strictEqual(
        normalizeUserId(null),
        "guest"
    );

    assert.strictEqual(
        normalizeUserId(""),
        "guest"
    );

    assert.strictEqual(
        normalizeUserId(123),
        "123"
    );

    console.log("✓ User identity normalization");

    // =====================================
    // MESSAGE NORMALIZATION
    // =====================================

    assert.strictEqual(
        normalizeMessage("  hello  "),
        "hello"
    );

    console.log("✓ Message normalization");

    // =====================================
    // REQUEST VALIDATION
    // =====================================

    assert.throws(
        () => validateAssistantRequest(null),
        /Assistant request must be an object/
    );

    assert.throws(
        () => validateAssistantRequest({}),
        /Assistant message is required/
    );

    assert.throws(
        () => validateAssistantRequest({
            message: "hello",
            context: []
        }),
        /Invalid assistant context/
    );

    assert.throws(
        () => validateAssistantRequest({
            message: "hello",
            memory: []
        }),
        /Invalid assistant memory/
    );

    assert.throws(
        () => validateAssistantRequest({
            message: "hello",
            intelligence: []
        }),
        /Invalid assistant intelligence/
    );

    assert.strictEqual(
        validateAssistantRequest({
            message: "hello",
            context: {},
            memory: {},
            intelligence: {}
        }),
        true
    );

    console.log("✓ Assistant request validation");

    // =====================================
    // AI REQUEST CONSTRUCTION
    // =====================================

    const request =
        buildAIRequest({
            userId: "test-user",
            message: "  Explain photosynthesis.  "
        });

    assert.strictEqual(
        request.userId,
        "test-user"
    );

    assert.strictEqual(
        request.message,
        "Explain photosynthesis."
    );

    assert.ok(
        request.systemPrompt.includes("You are ChatTBM.")
    );

    console.log("✓ AI request construction");

    // =====================================
    // DEFAULT USER ID
    // =====================================

    const guestRequest =
        buildAIRequest({
            message: "Hello"
        });

    assert.strictEqual(
        guestRequest.userId,
        "guest"
    );

    console.log("✓ Guest identity protection");

    // =====================================
    // FAILURE NORMALIZATION
    // =====================================

    const normalized =
        normalizeAssistantError(
            new Error("Simulated assistant failure")
        );

    assert.strictEqual(
        normalized.code,
        "ASSISTANT_ERROR"
    );

    assert.strictEqual(
        normalized.message,
        "Simulated assistant failure"
    );

    console.log("✓ Assistant failure normalization");

    // =====================================
    // CONTROLLED PROVIDER FAILURE
    // =====================================

    const result =
        await generateReply({
            message: "Test provider availability"
        });

    assert.strictEqual(
        result.success,
        false
    );

    assert.strictEqual(
        result.userId,
        "guest"
    );

    assert.ok(
        result.error
    );

    assert.strictEqual(
        result.error.code,
                "PROVIDER_UNAVAILABLE"
    );

    console.log(
        "✓ Controlled provider-unavailable handling"
    );

    console.log(
        "\n=== ASSISTANT ENGINE VERIFIED ===\n"
    );
}

runTests().catch(error => {

    console.error(
        "\n=== ASSISTANT ENGINE FAILED ==="
    );

    console.error(
        error
    );

    process.exitCode = 1;

});
