'use strict';

const assert = require("assert");

const {
    chatHandler
} = require("../controllers/chatController");

async function runTests() {

    console.log("\n=== CHAT CONTROLLER TEST ===\n");

    // =====================================
    // RESPONSE MOCK
    // =====================================

    function createResponseMock() {

        return {

            statusCode: 200,
            body: null,

            status(code) {

                this.statusCode = code;

                return this;

            },

            json(data) {

                this.body = data;

                return this;

            }

        };

    }

    // =====================================
    // INVALID REQUEST
    // =====================================

    const invalidResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                message: ""
            }
        },
        invalidResponse
    );

    assert.strictEqual(
        invalidResponse.statusCode,
        400
    );

    assert.strictEqual(
        invalidResponse.body.success,
        false
    );

    assert.strictEqual(
        invalidResponse.body.message,
        "Message is required."
    );

    console.log(
        "✓ Invalid request HTTP protection"
    );

    // =====================================
    // CONTROLLED PROVIDER FAILURE
    // =====================================

    const failureResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                message:
                    "Controller provider failure test"
            }
        },
        failureResponse
    );

    assert.strictEqual(
        failureResponse.statusCode,
        503
    );

    assert.strictEqual(
        failureResponse.body.success,
        false
    );

    assert.ok(
        failureResponse.body.error
    );

    assert.strictEqual(
        failureResponse.body.error.code,
        "PROVIDER_UNAVAILABLE"
    );

    assert.ok(
        failureResponse.body.error.message
    );

    console.log(
        "✓ Provider failure HTTP translation"
    );

    // =====================================
    // FALSE SUCCESS PROTECTION
    // =====================================

    assert.notStrictEqual(
        failureResponse.body.success,
        true
    );

    console.log(
        "✓ False-success protection"
    );

    console.log(
        "\n=== CHAT CONTROLLER VERIFIED ===\n"
    );
}

runTests().catch(error => {

    console.error(
        "\n=== CHAT CONTROLLER FAILED ==="
    );

    console.error(error);

    process.exitCode = 1;

});
