'use strict';

const {
    isValidPaymentProvider,
    isValidSubscriptionState
} = require('./PaymentTypes');

function createSubscription(input = {}) {
    const {
        id,
        userId,
        provider,
        lifecycle = 'pending',
        createdAt = new Date().toISOString(),
        updatedAt = createdAt
    } = input;

    if (!id || typeof id !== 'string') {
        throw new Error('Subscription id is required.');
    }

    if (!userId || typeof userId !== 'string') {
        throw new Error('Subscription userId is required.');
    }

    if (!isValidPaymentProvider(provider)) {
        throw new Error('Invalid subscription provider.');
    }

    if (!isValidSubscriptionState(lifecycle)) {
        throw new Error('Invalid subscription lifecycle.');
    }

    return Object.freeze({
        id,
        version: 1,
        userId,
        provider,
        lifecycle,
        createdAt,
        updatedAt
    });
}

module.exports = {
    createSubscription
};
