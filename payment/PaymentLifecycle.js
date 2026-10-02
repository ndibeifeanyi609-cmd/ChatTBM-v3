'use strict';

const T = require('./PaymentTypes');

const PAYMENT_TRANSACTION_TRANSITIONS = {
    created: ['pending', 'failed', 'cancelled'],
    pending: ['succeeded', 'failed', 'cancelled'],
    succeeded: [],
    failed: [],
    cancelled: []
};

const SUBSCRIPTION_TRANSITIONS = {
    pending: ['active', 'cancelled'],
    active: ['past_due', 'cancelled', 'expired'],
    past_due: ['active', 'cancelled', 'expired'],
    cancelled: ['expired'],
    expired: []
};

const ENTITLEMENT_TRANSITIONS = {
    pending: ['active', 'revoked'],
    active: ['suspended', 'revoked', 'expired'],
    suspended: ['active', 'revoked', 'expired'],
    revoked: [],
    expired: []
};

function can(transitions, validator, from, to) {
    if (!validator(from) || !validator(to)) return false;
    if (from === to) return true;
    return (transitions[from] || []).includes(to);
}

function canPayment(from, to) {
    return can(
        PAYMENT_TRANSACTION_TRANSITIONS,
        T.isValidPaymentTransactionState,
        from,
        to
    );
}

function canSubscription(from, to) {
    return can(
        SUBSCRIPTION_TRANSITIONS,
        T.isValidSubscriptionState,
        from,
        to
    );
}

function canEntitlement(from, to) {
    return can(
        ENTITLEMENT_TRANSITIONS,
        T.isValidEntitlementState,
        from,
        to
    );
}

function transition(object, next, checker, name) {
    if (!object) {
        return {
            success: false,
            object: null,
            error: `${name} object is required.`
        };
    }

    const current = object.lifecycle;

    if (!checker(current, next)) {
        return {
            success: false,
            object,
            error:
                `Invalid ${name} lifecycle transition: ` +
                `${current} → ${next}`
        };
    }

    if (current === next) {
        return {
            success: true,
            object,
            previousState: current,
            currentState: next,
            idempotent: true
        };
    }

    return {
        success: true,
        object: {
            ...object,
            lifecycle: next,
            updatedAt: new Date().toISOString()
        },
        previousState: current,
        currentState: next,
        idempotent: false
    };
}

function transitionPayment(transaction, next) {
    return transition(
        transaction,
        next,
        canPayment,
        'Payment Transaction'
    );
}

function transitionSubscription(subscription, next) {
    return transition(
        subscription,
        next,
        canSubscription,
        'Subscription'
    );
}

function transitionEntitlement(entitlement, next) {
    return transition(
        entitlement,
        next,
        canEntitlement,
        'Entitlement'
    );
}

module.exports = {
    PAYMENT_TRANSACTION_TRANSITIONS,
    SUBSCRIPTION_TRANSITIONS,
    ENTITLEMENT_TRANSITIONS,
    canPayment,
    canSubscription,
    canEntitlement,
    transitionPayment,
    transitionSubscription,
    transitionEntitlement
};
