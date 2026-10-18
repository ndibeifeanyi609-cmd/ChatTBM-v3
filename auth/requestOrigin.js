'use strict';

function isAllowedRequestOrigin(origin, allowedOrigins) {
    return typeof origin === 'string' &&
        origin.length > 0 &&
        allowedOrigins instanceof Set &&
        allowedOrigins.has(origin);
}

module.exports = { isAllowedRequestOrigin };
