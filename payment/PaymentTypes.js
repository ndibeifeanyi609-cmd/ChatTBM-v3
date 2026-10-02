'use strict';

// =====================================
// ChatTBM
// REG-096 Payment & Subscription
//
// Canonical Payment Types
// =====================================

const PAYMENT_PROVIDERS = Object.freeze([
    'flutterwave',
    'apple_iap'
]);

const PAYMENT_TRANSACTION_STATES = Object.freeze([
    'created',
    'pending',
    'succeeded',
    'failed',
    'cancelled'
]);

const SUBSCRIPTION_STATES = Object.freeze([
    'pending',
    'active',
    'past_due',
    'cancelled',
    'expired'
]);

const ENTITLEMENT_STATES = Object.freeze([
    'pending',
    'active',
    'suspended',
    'revoked',
    'expired'
]);

function isValidPaymentProvider(provider) {
    return PAYMENT_PROVIDERS.includes(provider);
}

function isValidPaymentTransactionState(state) {
    return PAYMENT_TRANSACTION_STATES.includes(state);
}

function isValidSubscriptionState(state) {
    return SUBSCRIPTION_STATES.includes(state);
}

function isValidEntitlementState(state) {
    return ENTITLEMENT_STATES.includes(state);
}

module.exports = {
    PAYMENT_PROVIDERS,
    PAYMENT_TRANSACTION_STATES,
    SUBSCRIPTION_STATES,
    ENTITLEMENT_STATES,
    isValidPaymentProvider,
    isValidPaymentTransactionState,
    isValidSubscriptionState,
    isValidEntitlementState
};
