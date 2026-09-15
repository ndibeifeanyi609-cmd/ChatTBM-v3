'use strict';

const assert = require("assert");

const {
    chatHandler
} = require("../controllers/chatController");

const {
    createContext
} = require("../context/ContextBoundary");

const {
    clearContexts
} = require("../context/ContextPersistence");

async function runTests() {

    console.log("\n=== REG-091 CHAT CONTROLLER TEST ===\n");

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

    clearContexts();

    // =====================================
    // MISSING USER ID
    // =====================================

    const missingUserResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                interactionId: "interaction-091",
                message: "hello"
            }
        },
        missingUserResponse
    );

    assert.strictEqual(
        missingUserResponse.statusCode,
        400
    );

    assert.strictEqual(
        missingUserResponse.body.success,
        false
    );

    assert.strictEqual(
        missingUserResponse.body.error.code,
        "CHAT_INTERACTION_ERROR"
    );

    assert.strictEqual(
        missingUserResponse.body.error.message,
        "userId is required."
    );

    console.log(
        "✓ Missing userId HTTP protection"
    );

    // =====================================
    // MISSING INTERACTION ID
    // =====================================

    const missingInteractionResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                userId: "user-091",
                message: "hello"
            }
        },
        missingInteractionResponse
    );

    assert.strictEqual(
        missingInteractionResponse.statusCode,
        400
    );

    assert.strictEqual(
        missingInteractionResponse.body.success,
        false
    );

    assert.strictEqual(
        missingInteractionResponse.body.error.message,
        "interactionId is required."
    );

    console.log(
        "✓ Missing interactionId HTTP protection"
    );

    // =====================================
    // MISSING MESSAGE
    // =====================================

    const missingMessageResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                userId: "user-091",
                interactionId: "interaction-091",
                message: ""
            }
        },
        missingMessageResponse
    );

    assert.strictEqual(
        missingMessageResponse.statusCode,
        400
    );

    assert.strictEqual(
        missingMessageResponse.body.success,
        false
    );

    assert.strictEqual(
        missingMessageResponse.body.error.message,
        "Message is required."
    );

    console.log(
        "✓ Missing message HTTP protection"
    );

    // =====================================
    // CANONICAL CONTEXT
    // =====================================

    const contextResult =
        createContext({
            userId: "user-091",
            interactionId: "interaction-091",
            value: {
                message: "controller test"
            }
        });

    assert.strictEqual(
        contextResult.success,
        true
    );

    // =====================================
    // CONTROLLED PROVIDER FAILURE
    // =====================================

    const failureResponse =
        createResponseMock();

    await chatHandler(
        {
            body: {
                userId: "user-091",
                interactionId: "interaction-091",
                message:
                    "Controller provider failure test"
            }
        },
        failureResponse
    );

    assert.strictEqual(
        failureResponse.body.success,
        false
    );

    assert.strictEqual(
        failureResponse.body.userId,
        "user-091"
    );

    assert.strictEqual(
        failureResponse.body.interactionId,
        "interaction-091"
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
        "\n=== REG-091 CHAT CONTROLLER VERIFIED ===\n"
    );
}

runTests().catch(error => {

    console.error(
        "\n=== REG-091 CHAT CONTROLLER FAILED ==="
    );

    console.error(error);

    process.exitCode = 1;

});
