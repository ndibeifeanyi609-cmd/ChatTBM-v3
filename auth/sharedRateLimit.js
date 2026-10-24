'use strict';

const crypto = require('node:crypto');

function createSharedRateLimiter({ store, windowMs = 15 * 60 * 1000, max = 10, scope = 'auth', now = Date.now, onError } = {}) {
    if (!store || typeof store.consume !== 'function') throw new TypeError('A rate-limit store with consume() is required.');
    if (!Number.isSafeInteger(windowMs) || windowMs < 1 || !Number.isInteger(max) || max < 1 || typeof scope !== 'string' || !scope) {
        throw new TypeError('Rate limiter requires a scope, positive windowMs, and positive integer max.');
    }

    return async function sharedRateLimit(req, res, next) {
        const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
        const key = scope + ':' + crypto.createHash('sha256').update(ip, 'utf8').digest('hex');
        let bucket;
        try {
            bucket = await store.consume(key, windowMs);
            if (!bucket || !Number.isSafeInteger(bucket.count) || bucket.count < 1 || !Number.isFinite(bucket.startedAt)) {
                throw new Error('Rate-limit store returned an invalid bucket.');
            }
        } catch (error) {
            if (typeof onError === 'function') {
                try { onError(error); } catch (_) { /* Preserve fail-closed behavior. */ }
            }
            return res.status(503).json({ success: false, error: { code: 'RATE_LIMIT_STORAGE_UNAVAILABLE', message: 'Authentication is temporarily unavailable. Please try again shortly.' } });
        }

        const remainingMs = Math.max(0, windowMs - Math.max(0, now() - bucket.startedAt));
        res.set('RateLimit-Limit', String(max));
        res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
        if (bucket.count > max) {
            res.set('Retry-After', String(Math.max(1, Math.ceil(remainingMs / 1000))));
            return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } });
        }
        return next();
    };
}

module.exports = { createSharedRateLimiter };
