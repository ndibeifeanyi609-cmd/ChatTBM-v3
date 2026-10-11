'use strict';

// =====================================
// ChatTBM
// REG-096 Payment & Subscription
//
// Canonical Payment Registry
//
// Responsibility:
// - Validate canonical Payment objects
// - Register canonical Payment objects
// - Preserve payment identity
// - Preserve ownership
// - Protect idempotency conflicts
// - Protect provider-reference conflicts
// - Support canonical retrieval
//
// Does NOT:
// - Own persistence
// - Implement provider SDKs
// - Process external payments
// - Grant entitlements
// =====================================

const {
    isValidPaymentProvider,
    isValidPaymentTransactionState,
    isValidSubscriptionState,
    isValidEntitlementState
} = require('./PaymentTypes');

const {
    PAYMENT_TRANSACTION_TRANSITIONS,
    SUBSCRIPTION_TRANSITIONS,
    ENTITLEMENT_TRANSITIONS
} = require('./PaymentLifecycle');

const paymentTransactions = new Map();
const subscriptions = new Map();
const entitlements = new Map();
const providerReferences = new Map();

const paymentIdsByIdempotencyKey = new Map();
const providerReferenceIdsByKey = new Map();

const PAYMENT_TRANSACTION_REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'provider',
    'idempotencyKey',
    'lifecycle',
    'createdAt',
    'updatedAt'
];

const SUBSCRIPTION_REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'provider',
    'lifecycle',
    'createdAt',
    'updatedAt'
];

const ENTITLEMENT_REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'subscriptionId',
    'lifecycle',
    'createdAt',
    'updatedAt'
];

const PROVIDER_REFERENCE_REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'provider',
    'providerObjectType',
    'providerObjectId',
    'canonicalObjectType',
    'canonicalObjectId',
    'createdAt'
];

function validateObject(
    object,
    requiredFields,
    name
) {
    if (
        !object ||
        typeof object !== 'object' ||
        Array.isArray(object)
    ) {
        throw new Error(
            `${name} must be an object.`
        );
    }

    for (const field of requiredFields) {
        if (
            object[field] === undefined ||
            object[field] === null ||
            object[field] === ''
        ) {
            throw new Error(
                `Missing required ${name} field: ${field}`
            );
        }
    }

    if (object.version !== 1) {
        throw new Error(
            `Unsupported ${name} version: ${object.version}`
        );
    }

    return true;
}

function validatePaymentTransaction(
    transaction
) {
    validateObject(
        transaction,
        PAYMENT_TRANSACTION_REQUIRED_FIELDS,
        'Payment Transaction'
    );

    if (
        !isValidPaymentProvider(
            transaction.provider
        )
    ) {
        throw new Error(
            `Invalid payment provider: ${transaction.provider}`
        );
    }

    if (
        !isValidPaymentTransactionState(
            transaction.lifecycle
        )
    ) {
        throw new Error(
            `Invalid payment transaction lifecycle: ${transaction.lifecycle}`
        );
    }

    return true;
}

function validateSubscription(
    subscription
) {
    validateObject(
        subscription,
        SUBSCRIPTION_REQUIRED_FIELDS,
        'Subscription'
    );

    if (
        !isValidPaymentProvider(
            subscription.provider
        )
    ) {
        throw new Error(
            `Invalid subscription provider: ${subscription.provider}`
        );
    }

    if (
        !isValidSubscriptionState(
            subscription.lifecycle
        )
    ) {
        throw new Error(
            `Invalid subscription lifecycle: ${subscription.lifecycle}`
        );
    }

    return true;
}

function validateEntitlement(
    entitlement
) {
    validateObject(
        entitlement,
        ENTITLEMENT_REQUIRED_FIELDS,
        'Entitlement'
    );

    if (
        !isValidEntitlementState(
            entitlement.lifecycle
        )
    ) {
        throw new Error(
            `Invalid entitlement lifecycle: ${entitlement.lifecycle}`
        );
    }

    return true;
}

function validateProviderReference(
    reference
) {
    validateObject(
        reference,
        PROVIDER_REFERENCE_REQUIRED_FIELDS,
        'Provider Reference'
    );

    if (
        !isValidPaymentProvider(
            reference.provider
        )
    ) {
        throw new Error(
            `Invalid provider: ${reference.provider}`
        );
    }

    return true;
}

function paymentTransactionIdentity(
    transaction
) {
    return [
        transaction.id,
        transaction.userId,
        transaction.idempotencyKey
    ];
}

function subscriptionIdentity(
    subscription
) {
    return [
        subscription.id,
        subscription.userId
    ];
}

function entitlementIdentity(
    entitlement
) {
    return [
        entitlement.id,
        entitlement.userId,
        entitlement.subscriptionId
    ];
}

function providerReferenceKey(
    reference
) {
    return [
        reference.provider,
        reference.providerObjectType,
        reference.providerObjectId
    ].join(':');
}

function recordsAreEquivalent(
    existing,
    incoming
) {
    return JSON.stringify(existing) ===
        JSON.stringify(incoming);
}

function clone(object) {
    return {
        ...object
    };
}

function registerPaymentTransaction(
    transaction
) {
    validatePaymentTransaction(
        transaction
    );

    const existing =
        paymentTransactions.get(
            transaction.id
        );

    const existingByKey =
        paymentIdsByIdempotencyKey.get(
            transaction.idempotencyKey
        );

    if (
        existingByKey &&
        existingByKey !== transaction.id
    ) {
        return {
            transaction: getPaymentTransaction(
                existingByKey
            ),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error:
                'Payment Transaction idempotency key already exists.'
        };
    }

    if (!existing) {
        const stored = clone(transaction);

        paymentTransactions.set(
            transaction.id,
            stored
        );

        paymentIdsByIdempotencyKey.set(
            transaction.idempotencyKey,
            transaction.id
        );

        return {
            transaction: clone(stored),
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };
    }

    if (
        existing.userId !==
        transaction.userId
    ) {
        return {
            transaction: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error:
                'Payment Transaction ownership conflict.'
        };
    }

    if (
        existing.idempotencyKey !==
        transaction.idempotencyKey
    ) {
        return {
            transaction: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error:
                'Payment Transaction identity conflict.'
        };
    }

    if (!canTransitionPayment(existing.lifecycle, transaction.lifecycle)) {
        return {
            transaction: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: "Invalid Payment Transaction lifecycle transition."
        };
    }

    if (
        recordsAreEquivalent(
            existing,
            transaction
        )
    ) {
        return {
            transaction: clone(existing),
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };
    }

    const updated = {
        ...existing,
        ...transaction,
        id: existing.id,
        userId: existing.userId,
        idempotencyKey:
            existing.idempotencyKey
    };

    paymentTransactions.set(
        transaction.id,
        updated
    );

    return {
        transaction: clone(updated),
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };
}

function registerSubscription(subscription) {
    validateSubscription(subscription);

    const existing = subscriptions.get(subscription.id);

    if (!existing) {
        const stored = clone(subscription);
        subscriptions.set(subscription.id, stored);

        return {
            subscription: clone(stored),
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };
    }

    if (existing.userId !== subscription.userId) {
        return {
            subscription: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Subscription ownership conflict.'
        };
    }

    if (existing.provider !== subscription.provider) {
        return {
            subscription: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Subscription provider identity conflict.'
        };
    }

    if (!canTransitionSubscription(existing.lifecycle, subscription.lifecycle)) {
        return {
            subscription: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: "Invalid Subscription lifecycle transition."
        };
    }

    if (recordsAreEquivalent(existing, subscription)) {
        return {
            subscription: clone(existing),
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };
    }

    const updated = {
        ...existing,
        ...subscription,
        id: existing.id,
        userId: existing.userId,
        provider: existing.provider
    };

    subscriptions.set(subscription.id, updated);

    return {
        subscription: clone(updated),
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };
}


function registerEntitlement(entitlement) {
    validateEntitlement(entitlement);

    const existing = entitlements.get(entitlement.id);

    if (!existing) {
        const stored = clone(entitlement);
        entitlements.set(entitlement.id, stored);

        return {
            entitlement: clone(stored),
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };
    }

    if (existing.userId !== entitlement.userId) {
        return {
            entitlement: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Entitlement ownership conflict.'
        };
    }

    if (existing.subscriptionId !== entitlement.subscriptionId) {
        return {
            entitlement: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Entitlement subscription identity conflict.'
        };
    }

    if (!canTransitionEntitlement(existing.lifecycle, entitlement.lifecycle)) {
        return {
            entitlement: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: "Invalid Entitlement lifecycle transition."
        };
    }

    if (recordsAreEquivalent(existing, entitlement)) {
        return {
            entitlement: clone(existing),
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };
    }

    const updated = {
        ...existing,
        ...entitlement,
        id: existing.id,
        userId: existing.userId,
        subscriptionId: existing.subscriptionId
    };

    entitlements.set(entitlement.id, updated);

    return {
        entitlement: clone(updated),
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };
}


function registerProviderReference(reference) {
    validateProviderReference(reference);

    const key = providerReferenceKey(reference);
    const existing = providerReferences.get(reference.id);
    const existingByKey = providerReferenceIdsByKey.get(key);

    if (existingByKey && existingByKey !== reference.id) {
        return {
            reference: getProviderReference(existingByKey),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Provider Reference identity already exists.'
        };
    }

    if (!existing) {
        const stored = clone(reference);
        providerReferences.set(reference.id, stored);
        providerReferenceIdsByKey.set(key, reference.id);

        return {
            reference: clone(stored),
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };
    }

    if (existing.userId !== reference.userId) {
        return {
            reference: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Provider Reference ownership conflict.'
        };
    }

    if (providerReferenceKey(existing) !== key) {
        return {
            reference: clone(existing),
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error: 'Provider Reference identity conflict.'
        };
    }

    if (recordsAreEquivalent(existing, reference)) {
        return {
            reference: clone(existing),
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };
    }

    const updated = {
        ...existing,
        ...reference,
        id: existing.id,
        userId: existing.userId,
        provider: existing.provider,
        providerObjectType: existing.providerObjectType,
        providerObjectId: existing.providerObjectId
    };

    providerReferences.set(reference.id, updated);

    return {
        reference: clone(updated),
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };
}


function getPaymentTransaction(id) {
    const transaction = paymentTransactions.get(id);
    return transaction ? clone(transaction) : null;
}

function getSubscription(id) {
    const subscription = subscriptions.get(id);
    return subscription ? clone(subscription) : null;
}

function getEntitlement(id) {
    const entitlement = entitlements.get(id);
    return entitlement ? clone(entitlement) : null;
}

function getProviderReference(id) {
    const reference = providerReferences.get(id);
    return reference ? clone(reference) : null;
}

function getPaymentTransactionByIdempotencyKey(key) {
    const id = paymentIdsByIdempotencyKey.get(key);
    return id ? getPaymentTransaction(id) : null;
}

function getProviderReferenceByKey(provider, providerObjectType, providerObjectId) {
    const key = [provider, providerObjectType, providerObjectId].join(':');
    const id = providerReferenceIdsByKey.get(key);
    return id ? getProviderReference(id) : null;
}


function getPaymentTransactionsByUser(userId) {
    const results = [];

    for (const transaction of paymentTransactions.values()) {
        if (transaction.userId === userId) {
            results.push(clone(transaction));
        }
    }

    return results;
}

function getSubscriptionsByUser(userId) {
    const results = [];

    for (const subscription of subscriptions.values()) {
        if (subscription.userId === userId) {
            results.push(clone(subscription));
        }
    }

    return results;
}

function getEntitlementsByUser(userId) {
    const results = [];

    for (const entitlement of entitlements.values()) {
        if (entitlement.userId === userId) {
            results.push(clone(entitlement));
        }
    }

    return results;
}

function getProviderReferencesByUser(userId) {
    const results = [];

    for (const reference of providerReferences.values()) {
        if (reference.userId === userId) {
            results.push(clone(reference));
        }
    }

    return results;
}


function clearPaymentRegistry() {
    paymentTransactions.clear();
    subscriptions.clear();
    entitlements.clear();
    providerReferences.clear();
    paymentIdsByIdempotencyKey.clear();
    providerReferenceIdsByKey.clear();
}


module.exports = {
    validatePaymentTransaction,
    validateSubscription,
    validateEntitlement,
    validateProviderReference,

    registerPaymentTransaction,
    registerSubscription,
    registerEntitlement,
    registerProviderReference,

    getPaymentTransaction,
    getSubscription,
    getEntitlement,
    getProviderReference,

    getPaymentTransactionByIdempotencyKey,
    getProviderReferenceByKey,

    getPaymentTransactionsByUser,
    getSubscriptionsByUser,
    getEntitlementsByUser,
    getProviderReferencesByUser,

    clearPaymentRegistry
};

function canTransitionPayment(fromState, toState) {
    if (fromState === toState) {
        return true;
    }

    return Boolean(
        PAYMENT_TRANSACTION_TRANSITIONS[fromState] &&
        PAYMENT_TRANSACTION_TRANSITIONS[fromState].includes(toState)
    );
}

function canTransitionSubscription(fromState, toState) {
    if (fromState === toState) {
        return true;
    }

    return Boolean(
        SUBSCRIPTION_TRANSITIONS[fromState] &&
        SUBSCRIPTION_TRANSITIONS[fromState].includes(toState)
    );
}

function canTransitionEntitlement(fromState, toState) {
    if (fromState === toState) {
        return true;
    }

    return Boolean(
        ENTITLEMENT_TRANSITIONS[fromState] &&
        ENTITLEMENT_TRANSITIONS[fromState].includes(toState)
    );
}
