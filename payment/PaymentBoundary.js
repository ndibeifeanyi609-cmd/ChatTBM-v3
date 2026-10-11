'use strict';

// =====================================
// ChatTBM
// REG-096 Payment & Subscription
//
// Canonical Payment Boundary
//
// Responsibility:
// - Validate payment requests
// - Preserve canonical ownership
// - Enforce idempotency
// - Delegate provider execution
// - Normalize provider results/failures
// - Protect canonical payment state
//
// Does NOT:
// - Implement provider SDKs
// - Store provider credentials
// - Own authentication
// - Grant entitlement from unverified payment
// =====================================

const {
    isValidPaymentProvider
} = require('./PaymentTypes');

const {
    createPaymentTransaction
} = require('./PaymentTransaction');

const PaymentRegistry =
    require('./PaymentRegistry');

const crypto = require('crypto');
const PaymentPersistence =
    require('./PaymentPersistence');


function normalizeFailure(code, message) {
    return {
        success: false,
        error: {
            code,
            message
        }
    };
}

function normalizeSuccess(transaction) {
    return {
        success: true,
        paymentTransaction: transaction
    };
}


function validateRequest(request) {
    if (
        !request ||
        typeof request !== 'object' ||
        Array.isArray(request)
    ) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Payment request must be an object.'
        );
    }

    const {
        userId,
        provider,
        idempotencyKey,
        providerRequest
    } = request;

    if (
        !userId ||
        typeof userId !== 'string'
    ) {
        return normalizeFailure(
            'MISSING_USER_IDENTITY',
            'Payment user identity is required.'
        );
    }

    if (!isValidPaymentProvider(provider)) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Invalid payment provider.'
        );
    }

    if (
        !idempotencyKey ||
        typeof idempotencyKey !== 'string'
    ) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Payment idempotency key is required.'
        );
    }

    if (
        !providerRequest ||
        typeof providerRequest !== 'object' ||
        Array.isArray(providerRequest)
    ) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Provider payment request is required.'
        );
    }

    return {
        success: true,
        request: {
            userId,
            provider,
            idempotencyKey,
            providerRequest
        }
    };
}


function validateAdapterResult(result) {
    if (
        !result ||
        typeof result !== 'object' ||
        Array.isArray(result)
    ) {
        return normalizeFailure(
            'INVALID_PROVIDER_RESULT',
            'Payment provider returned an invalid result.'
        );
    }

    const {
        status,
        providerObjectType,
        providerObjectId,
        verified
    } = result;

    if (
        !['pending', 'succeeded', 'failed'].includes(status)
    ) {
        return normalizeFailure(
            'INVALID_PROVIDER_RESULT',
            'Payment provider returned an invalid payment status.'
        );
    }

    if (
        !providerObjectType ||
        typeof providerObjectType !== 'string'
    ) {
        return normalizeFailure(
            'INVALID_PROVIDER_RESULT',
            'Payment provider object type is required.'
        );
    }

    if (
        !providerObjectId ||
        typeof providerObjectId !== 'string'
    ) {
        return normalizeFailure(
            'INVALID_PROVIDER_RESULT',
            'Payment provider object id is required.'
        );
    }

    if (typeof verified !== 'boolean') {
        return normalizeFailure(
            'INVALID_PROVIDER_RESULT',
            'Payment provider verification status is required.'
        );
    }

    if (
        status === 'succeeded' &&
        verified !== true
    ) {
        return normalizeFailure(
            'PAYMENT_NOT_VERIFIED',
            'Payment success could not be verified.'
        );
    }

    return {
        success: true,
        result: {
            status,
            providerObjectType,
            providerObjectId,
            verified
        }
    };
}



function createCanonicalTransaction(
    userId,
    provider,
    idempotencyKey
) {
    const identity = JSON.stringify([
        userId,
        provider,
        idempotencyKey
    ]);

    const transactionId =
        `payment_${crypto
            .createHash('sha256')
            .update(identity)
            .digest('hex')}`;

    return createPaymentTransaction({
        id: transactionId,
        userId,
        provider,
        idempotencyKey,
        lifecycle: 'created'
    });
}


const providerAdapters = new Map();

function registerProviderAdapter(
    provider,
    adapter
) {
    if (
        !isValidPaymentProvider(provider)
    ) {
        throw new Error(
            'Invalid payment provider adapter provider.'
        );
    }

    if (
        !adapter ||
        typeof adapter.requestPayment !== 'function' ||
        typeof adapter.processProviderEvent !== 'function'
    ) {
        throw new Error(
            'Payment provider adapter must implement requestPayment() and processProviderEvent().'
        );
    }

    if (
        adapter.provider &&
        adapter.provider !== provider
    ) {
        throw new Error(
            'Payment provider adapter provider mismatch.'
        );
    }

    providerAdapters.set(
        provider,
        adapter
    );

    return {
        success: true,
        provider
    };
}

function getProviderAdapter(
    provider
) {
    return providerAdapters.get(
        provider
    ) || null;
}


function findExistingTransaction(
    userId,
    provider,
    idempotencyKey
) {
    const persisted =
        PaymentPersistence
            .getPaymentTransactionByIdempotencyKey(
                idempotencyKey
            );

    if (persisted) {
        if (
            persisted.userId !== userId ||
            persisted.provider !== provider
        ) {
            return {
                success: false,
                conflict: true,
                error: normalizeFailure(
                    'IDEMPOTENCY_CONFLICT',
                    'Payment idempotency key belongs to a different payment.'
                )
            };
        }

        return {
            success: true,
            transaction: persisted
        };
    }

    const registered =
        PaymentRegistry
            .getPaymentTransactionByIdempotencyKey(
                idempotencyKey
            );

    if (registered) {
        if (
            registered.userId !== userId ||
            registered.provider !== provider
        ) {
            return {
                success: false,
                conflict: true,
                error: normalizeFailure(
                    'IDEMPOTENCY_CONFLICT',
                    'Payment idempotency key belongs to a different payment.'
                )
            };
        }

        return {
            success: true,
            transaction: registered
        };
    }

    return {
        success: true,
        transaction: null
    };
}


function persistAndRegisterTransaction(
    transaction
) {
    let persisted;

    try {
        persisted =
            PaymentPersistence
                .savePaymentTransaction(
                    transaction
                );
    } catch (error) {
        return normalizeFailure(
            'PERSISTENCE_FAILURE',
            error.message ||
                'Payment transaction persistence failed.'
        );
    }

    let registered;

    try {
        registered =
            PaymentRegistry
                .registerPaymentTransaction(
                    persisted
                );
    } catch (error) {
        return normalizeFailure(
            'REGISTRY_FAILURE',
            error.message ||
                'Payment transaction registry failed.'
        );
    }

    if (
        !registered ||
        registered.conflict ||
        !registered.transaction
    ) {
        return normalizeFailure(
            'REGISTRY_CONFLICT',
            registered?.error ||
                'Payment transaction registry rejected the transaction.'
        );
    }

    return {
        success: true,
        transaction:
            registered.transaction
    };
}


function updateCanonicalTransaction(
    transaction,
    lifecycle
) {
    const nextTransaction = {
        ...transaction,
        lifecycle,
        updatedAt:
            new Date().toISOString()
    };

    let persisted;

    try {
        persisted =
            PaymentPersistence
                .updatePaymentTransaction(
                    nextTransaction
                );
    } catch (error) {
        return normalizeFailure(
            'PERSISTENCE_FAILURE',
            error.message ||
                'Payment transaction update failed.'
        );
    }

    let registered;

    try {
        registered =
            PaymentRegistry
                .registerPaymentTransaction(
                    persisted
                );
    } catch (error) {
        return normalizeFailure(
            'REGISTRY_FAILURE',
            error.message ||
                'Payment transaction registry update failed.'
        );
    }

    if (
        !registered ||
        registered.conflict ||
        !registered.transaction
    ) {
        return normalizeFailure(
            'REGISTRY_CONFLICT',
            registered?.error ||
                'Payment transaction registry rejected the update.'
        );
    }

    return {
        success: true,
        transaction:
            registered.transaction
    };
}


async function requestPayment(request) {
    const validation =
        validateRequest(request);

    if (!validation.success) {
        return validation;
    }

    const {
        userId,
        provider,
        idempotencyKey,
        providerRequest
    } = validation.request;

    const existing =
        findExistingTransaction(
            userId,
            provider,
            idempotencyKey
        );

    if (!existing.success) {
        return existing.error;
    }

    if (existing.transaction) {
        return normalizeSuccess(
            existing.transaction
        );
    }

    const adapter =
        getProviderAdapter(provider);

    if (!adapter) {
        return normalizeFailure(
            'PROVIDER_UNAVAILABLE',
            'Payment provider is unavailable.'
        );
    }

    const transaction =
        createCanonicalTransaction(
            userId,
            provider,
            idempotencyKey
        );

    const stored =
        persistAndRegisterTransaction(
            transaction
        );

    if (!stored.success) {
        return stored;
    }

    let providerResult;

    try {
        providerResult =
            await adapter.requestPayment(
                providerRequest
            );
    } catch (error) {
        const failed =
            updateCanonicalTransaction(
                stored.transaction,
                'failed'
            );

        if (!failed.success) {
            return failed;
        }

        return normalizeFailure(
            'PROVIDER_ERROR',
            error.message ||
                'Payment provider request failed.'
        );
    }

    const normalized =
        validateAdapterResult(
            providerResult
        );

    if (!normalized.success) {
        return normalized;
    }

    const result =
        normalized.result;

    const providerReference =
        persistAndRegisterProviderReference(
            stored.transaction,
            result
        );

    if (!providerReference.success) {
        return providerReference;
    }

    let updated;

    if (result.status === 'succeeded') {
        const pending =
            updateCanonicalTransaction(
                stored.transaction,
                'pending'
            );

        if (!pending.success) {
            return pending;
        }

        updated =
            updateCanonicalTransaction(
                pending.transaction,
                'succeeded'
            );
    } else {
        updated =
            updateCanonicalTransaction(
                stored.transaction,
                result.status
            );
    }

    return normalizeSuccess(
        updated.transaction
    );
}


function createProviderReferenceId(
    provider,
    providerObjectType,
    providerObjectId
) {
    const identity = JSON.stringify([
        provider,
        providerObjectType,
        providerObjectId
    ]);

    return `provider_ref_${crypto
        .createHash('sha256')
        .update(identity)
        .digest('hex')}`;
}

function persistAndRegisterProviderReference(
    transaction,
    result
) {
    const referenceId =
        createProviderReferenceId(
            transaction.provider,
            result.providerObjectType,
            result.providerObjectId
        );

    const reference = {
        id: referenceId,
        version: 1,
        userId: transaction.userId,
        provider: transaction.provider,
        providerObjectType:
            result.providerObjectType,
        providerObjectId:
            result.providerObjectId,
        canonicalObjectType:
            'payment_transaction',
        canonicalObjectId:
            transaction.id,
        createdAt:
            new Date().toISOString()
    };

    let persisted;

    try {
        persisted =
            PaymentPersistence
                .saveProviderReference(
                    reference
                );
    } catch (error) {
        return normalizeFailure(
            'PERSISTENCE_FAILURE',
            error.message ||
                'Provider reference persistence failed.'
        );
    }

    let registered;

    try {
        registered =
            PaymentRegistry
                .registerProviderReference(
                    persisted
                );
    } catch (error) {
        return normalizeFailure(
            'REGISTRY_FAILURE',
            error.message ||
                'Provider reference registry failed.'
        );
    }

    if (
        !registered ||
        registered.conflict ||
        !registered.reference
    ) {
        return normalizeFailure(
            'REGISTRY_CONFLICT',
            registered?.error ||
                'Provider reference registry rejected the reference.'
        );
    }

    return {
        success: true,
        reference:
            registered.reference
    };
}


async function processProviderEvent(request) {
    if (
        !request ||
        typeof request !== 'object' ||
        Array.isArray(request)
    ) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Provider event request must be an object.'
        );
    }

    const {
        provider,
        providerEvent
    } = request;

    if (!isValidPaymentProvider(provider)) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Invalid payment provider.'
        );
    }

    if (
        !providerEvent ||
        typeof providerEvent !== 'object' ||
        Array.isArray(providerEvent)
    ) {
        return normalizeFailure(
            'INVALID_REQUEST',
            'Provider event is required.'
        );
    }

    const adapter =
        getProviderAdapter(provider);

    if (!adapter) {
        return normalizeFailure(
            'PROVIDER_UNAVAILABLE',
            'Payment provider is unavailable.'
        );
    }

    let providerResult;

    try {
        providerResult =
            await adapter.processProviderEvent(
                providerEvent
            );
    } catch (error) {
        return normalizeFailure(
            'PROVIDER_ERROR',
            error.message ||
                'Payment provider event processing failed.'
        );
    }

    const normalized =
        validateAdapterResult(
            providerResult
        );

    if (!normalized.success) {
        return normalized;
    }

    const result =
        normalized.result;

    const reference =
        PaymentPersistence
            .getProviderReferenceByKey(
                provider,
                result.providerObjectType,
                result.providerObjectId
            );

    if (!reference) {
        return normalizeFailure(
            'PROVIDER_REFERENCE_NOT_FOUND',
            'Provider event does not match a known payment reference.'
        );
    }

    if (reference.provider !== provider) {
        return normalizeFailure(
            'UNAUTHORIZED_PROVIDER_EVENT',
            'Provider event does not belong to the registered provider.'
        );
    }

    if (
        reference.canonicalObjectType !==
        'payment_transaction'
    ) {
        return normalizeFailure(
            'INVALID_PROVIDER_REFERENCE',
            'Provider reference does not target a payment transaction.'
        );
    }

    const transaction =
        PaymentPersistence
            .getPaymentTransaction(
                reference.canonicalObjectId
            );

    if (!transaction) {
        return normalizeFailure(
            'CANONICAL_TRANSACTION_NOT_FOUND',
            'Canonical payment transaction does not exist.'
        );
    }

    if (
        transaction.userId !==
        reference.userId
    ) {
        return normalizeFailure(
            'UNAUTHORIZED_OWNERSHIP',
            'Provider reference ownership does not match the payment transaction.'
        );
    }

    if (
        transaction.provider !== provider
    ) {
        return normalizeFailure(
            'PROVIDER_REFERENCE_CONFLICT',
            'Payment transaction provider does not match the provider event.'
        );
    }

    if (
        transaction.lifecycle ===
        result.status
    ) {
        return normalizeSuccess(
            transaction
        );
    }

    const updated =
        updateCanonicalTransaction(
            transaction,
            result.status
        );

    if (!updated.success) {
        return updated;
    }

    return normalizeSuccess(
        updated.transaction
    );
}

module.exports = {
    requestPayment,
    registerProviderAdapter,
    getProviderAdapter,
    processProviderEvent
};
