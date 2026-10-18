'use strict';

function isAllowedRequestOrigin(origin, allowedOrigins) {
    return typeof origin === 'string' &&
        origin.length > 0 &&
        allowedOrigins instanceof Set &&
        allowedOrigins.has(origin);
}

function isTrustedMutationRequest(origin, authorization, allowedOrigins) {
    if (origin) return isAllowedRequestOrigin(origin, allowedOrigins);
    return /^Bearer\s+\S+/i.test(typeof authorization === 'string' ? authorization : '');
}

module.exports = { isAllowedRequestOrigin, isTrustedMutationRequest };
