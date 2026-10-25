'use strict';

/**
 * Pure product-access policy decision.
 *
 * This module is intentionally not wired into live routes. It makes no
 * database calls, does not create payment records, and does not trust
 * request-body flags. A caller must supply identity and entitlement facts
 * from trusted server-side sources.
 */

const ACCESS = Object.freeze({
    ALLOW: 'allow',
    DENY: 'deny',
    UNAVAILABLE: 'unavailable'
});

function decideProductAccess(input = {}) {
    const {
        userId,
        feature,
        policy,
        entitlement,
        founderUserId,
        founderAccountVerified = false,
        founderAccountEnabled = false
    } = input;

    if (typeof userId !== 'string' || !userId.trim()) {
        return Object.freeze({
            decision: ACCESS.DENY,
            code: 'AUTHENTICATION_REQUIRED',
            reason: 'A verified server-side user identity is required.'
        });
    }

    if (typeof feature !== 'string' || !feature.trim()) {
        return Object.freeze({
            decision: ACCESS.DENY,
            code: 'FEATURE_REQUIRED',
            reason: 'A product feature identifier is required.'
        });
    }

    if (!policy || typeof policy !== 'object' || typeof policy.requiresSubscription !== 'boolean') {
        return Object.freeze({
            decision: ACCESS.UNAVAILABLE,
            code: 'ACCESS_POLICY_UNAVAILABLE',
            reason: 'A trusted product-access policy is required.'
        });
    }

    if (founderUserId && userId === founderUserId) {
        if (founderAccountVerified !== true || founderAccountEnabled !== true) {
            return Object.freeze({
                decision: ACCESS.DENY,
                code: 'FOUNDER_ACCOUNT_NOT_ELIGIBLE',
                reason: 'Founder account verification and enabled status are required.'
            });
        }

        if (policy.founderExemptionEnabled === true && policy.founderExemptionAllowed === true) {
            return Object.freeze({
                decision: ACCESS.ALLOW,
                code: 'FOUNDER_EXEMPTION',
                reason: 'Founder exemption is enabled by trusted policy.'
            });
        }
    }

    if (policy.requiresSubscription === false) {
        return Object.freeze({
            decision: ACCESS.ALLOW,
            code: 'FEATURE_INCLUDED',
            reason: 'The trusted product policy does not require a subscription.'
        });
    }

    if (!entitlement || typeof entitlement.active !== 'boolean') {
        return Object.freeze({
            decision: ACCESS.UNAVAILABLE,
            code: 'ENTITLEMENT_UNAVAILABLE',
            reason: 'A trusted entitlement result is required.'
        });
    }

    if (entitlement.active === true && entitlement.userId === userId) {
        return Object.freeze({
            decision: ACCESS.ALLOW,
            code: 'ACTIVE_ENTITLEMENT',
            reason: 'An active entitlement belongs to the authenticated user.'
        });
    }

    return Object.freeze({
        decision: ACCESS.DENY,
        code: 'SUBSCRIPTION_REQUIRED',
        reason: 'This feature requires an active entitlement.'
    });
}

module.exports = {
    ACCESS,
    decideProductAccess
};
