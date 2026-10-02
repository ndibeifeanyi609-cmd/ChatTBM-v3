'use strict';

// =====================================
// ChatTBM
// REG-096 Payment & Subscription
//
// Provider-independent payment adapter
// contract.
//
// Responsibility:
// - Define the interface required by
//   Payment Boundary provider adapters
//
// Does NOT:
// - Implement Flutterwave
// - Implement Apple IAP
// - Store provider credentials
// - Own canonical payment state
// - Persist payment objects
// - Grant entitlements
// =====================================

class PaymentProviderAdapter {
    constructor(provider) {
        if (!provider || typeof provider !== 'string') {
            throw new Error(
                'Payment provider adapter provider is required.'
            );
        }

        this.provider = provider;
    }

    requestPayment() {
        throw new Error(
            'Payment provider adapter requestPayment() is not implemented.'
        );
    }

    processProviderEvent() {
        throw new Error(
            'Payment provider adapter processProviderEvent() is not implemented.'
        );
    }
}

module.exports = {
    PaymentProviderAdapter
};

/*
 * Adapter result contract:
 *
 * requestPayment() MUST return a normalized provider result:
 *
 * {
 *     status: 'pending' | 'succeeded' | 'failed',
 *     providerObjectType: string,
 *     providerObjectId: string,
 *     verified: boolean
 * }
 *
 * The Payment Boundary remains the authority for canonical
 * Payment Transaction lifecycle. Provider adapters MUST NOT
 * create or mutate canonical payment state.
 *
 * A provider result with status 'succeeded' MUST have
 * verified === true before the Boundary may transition
 * the canonical transaction to 'succeeded'.
 *
 * processProviderEvent() MUST return the same normalized
 * result shape after interpreting a provider event.
 */
