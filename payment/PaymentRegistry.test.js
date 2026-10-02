'use strict';

const assert = require('assert');
const PaymentRegistry = require('./PaymentRegistry');

function runTests() {
    PaymentRegistry.clearPaymentRegistry();

    const subscription = {
        id: 'sub-registry-test',
        version: 1,
        userId: 'registry-test-user',
        provider: 'flutterwave',
        lifecycle: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const entitlement = {
        id: 'ent-registry-test',
        version: 1,
        userId: 'registry-test-user',
        subscriptionId: subscription.id,
        lifecycle: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    let result = PaymentRegistry.registerSubscription(subscription);

    assert.strictEqual(result.registered, true);
    assert.strictEqual(result.conflict, false);
    console.log('✓ Subscription registration works');

    result = PaymentRegistry.registerSubscription({
        ...subscription,
        userId: 'different-user'
    });

    assert.strictEqual(result.conflict, true);
    assert.strictEqual(
        result.error,
        'Subscription ownership conflict.'
    );
    console.log('✓ Subscription ownership conflict is rejected');

    result = PaymentRegistry.registerSubscription({
        ...subscription,
        lifecycle: 'active',
        updatedAt: new Date().toISOString()
    });

    assert.strictEqual(result.updated, true);
    assert.strictEqual(result.conflict, false);
    console.log('✓ Valid Subscription lifecycle transition works');

    result = PaymentRegistry.registerEntitlement(entitlement);

    assert.strictEqual(result.registered, true);
    assert.strictEqual(result.conflict, false);
    console.log('✓ Entitlement registration works');

    result = PaymentRegistry.registerEntitlement({
        ...entitlement,
        userId: 'different-user'
    });

    assert.strictEqual(result.conflict, true);
    assert.strictEqual(
        result.error,
        'Entitlement ownership conflict.'
    );
    console.log('✓ Entitlement ownership conflict is rejected');

    result = PaymentRegistry.registerEntitlement({
        ...entitlement,
        lifecycle: 'active',
        updatedAt: new Date().toISOString()
    });

    assert.strictEqual(result.updated, true);
    assert.strictEqual(result.conflict, false);
    console.log('✓ Valid Entitlement lifecycle transition works');

    result = PaymentRegistry.registerEntitlement({
        ...result.entitlement,
        lifecycle: 'pending',
        updatedAt: new Date().toISOString()
    });

    assert.strictEqual(result.conflict, true);
    assert.strictEqual(
        result.error,
        'Invalid Entitlement lifecycle transition.'
    );
    console.log('✓ Invalid Entitlement lifecycle transition is rejected');

    const storedSubscription =
        PaymentRegistry.getSubscription(subscription.id);

    const storedEntitlement =
        PaymentRegistry.getEntitlement(entitlement.id);

    assert.strictEqual(storedSubscription.lifecycle, 'active');
    assert.strictEqual(
        storedSubscription.userId,
        'registry-test-user'
    );
    assert.strictEqual(storedEntitlement.lifecycle, 'active');
    assert.strictEqual(
        storedEntitlement.userId,
        'registry-test-user'
    );
    assert.strictEqual(
        storedEntitlement.subscriptionId,
        subscription.id
    );

    console.log('✓ Canonical retrieval is correct');

    PaymentRegistry.clearPaymentRegistry();

    console.log('\n=== PAYMENT REGISTRY TEST PASSED ===\n');
}

try {
    runTests();
} catch (error) {
    console.error(error);
    process.exit(1);
}
