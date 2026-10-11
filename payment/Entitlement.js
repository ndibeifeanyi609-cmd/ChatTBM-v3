'use strict';

const {
    isValidEntitlementState
} = require('./PaymentTypes');

function createEntitlement(input = {}) {
    const {
        id,
        userId,
        subscriptionId,
        lifecycle = 'pending',
        createdAt = new Date().toISOString(),
        updatedAt = createdAt
    } = input;

    if (!id || typeof id !== 'string') {
        throw new Error('Entitlement id is required.');
    }

    if (!userId || typeof userId !== 'string') {
        throw new Error('Entitlement userId is required.');
    }

    if (
        !subscriptionId ||
        typeof subscriptionId !== 'string'
    ) {
        throw new Error(
            'Entitlement subscriptionId is required.'
        );
    }

    if (!isValidEntitlementState(lifecycle)) {
        throw new Error('Invalid entitlement lifecycle.');
    }

    return Object.freeze({
        id,
        version: 1,
        userId,
        subscriptionId,
        lifecycle,
        createdAt,
        updatedAt
    });
}

module.exports = {
    createEntitlement
};
