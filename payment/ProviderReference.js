'use strict';

const {
    isValidPaymentProvider
} = require('./PaymentTypes');

const CANONICAL_OBJECT_TYPES = Object.freeze([
    'payment_transaction',
    'subscription',
    'entitlement'
]);

function createProviderReference(input = {}) {
    const {
        id,
        userId,
        provider,
        providerObjectType,
        providerObjectId,
        canonicalObjectType,
        canonicalObjectId,
        createdAt = new Date().toISOString()
    } = input;

    if (!id || typeof id !== 'string') {
        throw new Error('Provider Reference id is required.');
    }

    if (!userId || typeof userId !== 'string') {
        throw new Error(
            'Provider Reference userId is required.'
        );
    }

    if (!isValidPaymentProvider(provider)) {
        throw new Error('Invalid payment provider.');
    }

    if (
        !providerObjectType ||
        typeof providerObjectType !== 'string'
    ) {
        throw new Error(
            'Provider object type is required.'
        );
    }

    if (
        !providerObjectId ||
        typeof providerObjectId !== 'string'
    ) {
        throw new Error(
            'Provider object id is required.'
        );
    }

    if (
        !CANONICAL_OBJECT_TYPES.includes(canonicalObjectType)
    ) {
        throw new Error(
            'Invalid canonical object type.'
        );
    }

    if (
        !canonicalObjectId ||
        typeof canonicalObjectId !== 'string'
    ) {
        throw new Error(
            'Canonical object id is required.'
        );
    }

    return Object.freeze({
        id,
        version: 1,
        userId,
        provider,
        providerObjectType,
        providerObjectId,
        canonicalObjectType,
        canonicalObjectId,
        createdAt
    });
}

module.exports = {
    CANONICAL_OBJECT_TYPES,
    createProviderReference
};
