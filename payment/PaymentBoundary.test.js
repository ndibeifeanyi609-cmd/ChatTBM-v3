'use strict';

const assert = require('assert');

const PaymentBoundary =
    require('./PaymentBoundary');

const PaymentPersistence =
    require('./PaymentPersistence');

const PaymentRegistry =
    require('./PaymentRegistry');

function createAdapter(overrides = {}) {
    return {
        requestPayment:
            async () => ({
                status: 'succeeded',
                providerObjectType: 'charge',
                providerObjectId: 'charge-test-001',
                verified: true
            }),

        processProviderEvent:
            async (providerEvent) => ({
                status: providerEvent.status || 'succeeded',
                providerObjectType:
                    providerEvent.providerObjectType || 'charge',
                providerObjectId:
                    providerEvent.providerObjectId || 'charge-test-001',
                verified:
                    providerEvent.verified !== undefined
                        ? providerEvent.verified
                        : true
            }),

        ...overrides
    };
}

async function runTests() {
    console.log(
        '\n=== PAYMENT BOUNDARY PROVIDER EVENT TEST ===\n'
    );

    PaymentPersistence.clearPaymentPersistence();
    PaymentRegistry.clearPaymentRegistry();

    PaymentBoundary.registerProviderAdapter(
        'flutterwave',
        createAdapter()
    );

    const payment =
        await PaymentBoundary.requestPayment({
            userId:
                'payment-event-test-user',
            provider:
                'flutterwave',
            idempotencyKey:
                'payment-event-idempotency-001',
            providerRequest: {
                amount: 10,
                currency: 'USD'
            }
        });

    assert.strictEqual(
        payment.success,
        true
    );

    assert.strictEqual(
        payment.paymentTransaction.lifecycle,
        'succeeded'
    );

    console.log(
        '✓ Canonical payment created'
    );

    const event =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.completed'
            }
        });

    assert.strictEqual(
        event.success,
        true
    );

    assert.strictEqual(
        event.paymentTransaction.lifecycle,
        'succeeded'
    );

    assert.strictEqual(
        event.paymentTransaction.id,
        payment.paymentTransaction.id
    );

    console.log(
        '✓ Provider event reconciles canonical payment'
    );

    const duplicate =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.completed'
            }
        });

    assert.strictEqual(
        duplicate.success,
        true
    );

    assert.strictEqual(
        duplicate.paymentTransaction.id,
        payment.paymentTransaction.id
    );

    assert.strictEqual(
        duplicate.paymentTransaction.lifecycle,
        'succeeded'
    );

    console.log(
        '✓ Duplicate provider event is idempotent'
    );

    const unknown =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.completed',
                providerObjectId: 'charge-unknown-999'
            }
        });

    assert.strictEqual(
        unknown.success,
        false
    );

    assert.strictEqual(
        unknown.error.code,
        'PROVIDER_REFERENCE_NOT_FOUND'
    );

    console.log(
        '✓ Unknown provider reference is rejected'
    );

    PaymentBoundary.registerProviderAdapter(
        'flutterwave',
        createAdapter({
            processProviderEvent:
                async (providerEvent) => ({
                    status: providerEvent.status || 'succeeded',
                    providerObjectType: 'charge',
                    providerObjectId: 'charge-test-001',
                    verified: true
                })
        })
    );

    const invalid =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.failed',
                status: 'failed'
            }
        });

    assert.strictEqual(
        invalid.success,
        false
    );

    assert.strictEqual(
        invalid.error.code,
        'REGISTRY_CONFLICT'
    );

    console.log(
        '✓ Invalid terminal lifecycle transition is rejected'
    );

    PaymentBoundary.registerProviderAdapter(
        'flutterwave',
        createAdapter({
            processProviderEvent:
                async () => ({
                    status: 'succeeded',
                    providerObjectType: 'charge',
                    providerObjectId:
                        'charge-test-001',
                    verified: false
                })
        })
    );

    const unverified =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.completed'
            }
        });

    assert.strictEqual(
        unverified.success,
        false
    );

    assert.strictEqual(
        unverified.error.code,
        'PAYMENT_NOT_VERIFIED'
    );

    console.log(
        '✓ Unverified provider success is rejected'
    );

    PaymentBoundary.registerProviderAdapter(
        'flutterwave',
        createAdapter({
            processProviderEvent:
                async () => {
                    throw new Error(
                        'Provider webhook failure'
                    );
                }
        })
    );

    const providerFailure =
        await PaymentBoundary.processProviderEvent({
            provider:
                'flutterwave',
            providerEvent: {
                event: 'payment.completed'
            }
        });

    assert.strictEqual(
        providerFailure.success,
        false
    );

    assert.strictEqual(
        providerFailure.error.code,
        'PROVIDER_ERROR'
    );

    console.log(
        '✓ Provider event failure is controlled'
    );

    console.log(
        '\n=== PAYMENT PROVIDER EVENT TEST PASSED ===\n'
    );
}

runTests().catch((error) => {
    console.error(error);
    process.exit(1);
});
