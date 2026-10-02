'use strict';

const {
    isValidPaymentProvider,
    isValidPaymentTransactionState
} = require('./PaymentTypes');

function createPaymentTransaction(input = {}) {
    const {
        id,
        userId,
        provider,
        idempotencyKey,
        lifecycle = 'created',
        createdAt = new Date().toISOString(),
        updatedAt = createdAt
    } = input;

    if (!id || typeof id !== 'string') {
        throw new Error('Payment Transaction id is required.');
    }

    if (!userId || typeof userId !== 'string') {
        throw new Error('Payment Transaction userId is required.');
    }

    if (!isValidPaymentProvider(provider)) {
        throw new Error('Invalid payment provider.');
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
        throw new Error(
            'Payment Transaction idempotencyKey is required.'
        );
    }

    if (!isValidPaymentTransactionState(lifecycle)) {
        throw new Error('Invalid payment transaction lifecycle.');
    }

    return Object.freeze({
        id,
        version: 1,
        userId,
        provider,
        idempotencyKey,
        lifecycle,
        createdAt,
        updatedAt
    });
}

module.exports = {
    createPaymentTransaction
};
