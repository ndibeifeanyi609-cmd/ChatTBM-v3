'use strict';

const assert = require('assert');

const {
    softwareBuildingHandler
} = require('../controllers/softwareBuildingController');

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

async function runTests() {
    console.log('\n=== SOFTWARE BUILDING CONTROLLER TEST ===\n');

    const invalidResponse = createResponseMock();

    await softwareBuildingHandler(
        {
            body: {
                operationId: 'controller-op-001',
                message: ''
            }
        },
        invalidResponse
    );

    assert.strictEqual(invalidResponse.statusCode, 400);
    assert.strictEqual(invalidResponse.body.success, false);
    assert.strictEqual(
        invalidResponse.body.error.code,
        'INVALID_REQUEST'
    );

    console.log('✓ Invalid request HTTP protection');

    const normalizedGuestResponse = createResponseMock();

    await softwareBuildingHandler(
        {
            body: {
                operationId: 'controller-op-002',
                message: 'Build a feature'
            }
        },
        normalizedGuestResponse
    );

    assert.strictEqual(normalizedGuestResponse.statusCode, 503);
    assert.strictEqual(normalizedGuestResponse.body.success, false);
    assert.strictEqual(
        normalizedGuestResponse.body.error.code,
        'DELEGATED_ASSISTANT_FAILURE'
    );
    assert.strictEqual(
        normalizedGuestResponse.body.error.causeCode,
        'PROVIDER_UNAVAILABLE'
    );

    console.log('✓ Request identity normalization and controlled failure');

    const failureResponse = createResponseMock();

    await softwareBuildingHandler(
        {
            body: {
                operationId: 'controller-op-003',
                message: 'Build a feature',
                userId: 'controller-test-user'
            }
        },
        failureResponse
    );

    assert.strictEqual(failureResponse.statusCode, 503);
    assert.strictEqual(failureResponse.body.success, false);
    assert.ok(failureResponse.body.error);
    assert.strictEqual(
        failureResponse.body.error.code,
        'DELEGATED_ASSISTANT_FAILURE'
    );
    assert.strictEqual(
        failureResponse.body.error.causeCode,
        'PROVIDER_UNAVAILABLE'
    );

    console.log('✓ Delegated failure HTTP translation');

    assert.notStrictEqual(
        failureResponse.body.success,
        true
    );

    console.log('✓ False-success protection');

    console.log('\n=== SOFTWARE BUILDING CONTROLLER VERIFIED ===\n');
}

runTests().catch(error => {
    console.error('\n=== SOFTWARE BUILDING CONTROLLER FAILED ===');
    console.error(error);
    process.exitCode = 1;
});
