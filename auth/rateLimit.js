'use strict';

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, now = Date.now } = {}) {
    if (!Number.isFinite(windowMs) || windowMs < 1 || !Number.isInteger(max) || max < 1) {
        throw new TypeError('Rate limiter requires a positive windowMs and integer max.');
    }

    const buckets = new Map();

    return function rateLimit(req, res, next) {
        const key = String(req.ip || req.socket?.remoteAddress || 'unknown');
        const time = now();
        let bucket = buckets.get(key);

        if (!bucket || time - bucket.startedAt >= windowMs) {
            bucket = { startedAt: time, count: 0 };
            buckets.set(key, bucket);
        }
        bucket.count += 1;

        for (const [client, entry] of buckets) {
            if (time - entry.startedAt >= windowMs) buckets.delete(client);
        }

        const remainingMs = Math.max(0, windowMs - (time - bucket.startedAt));
        res.set('RateLimit-Limit', String(max));
        res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));

        if (bucket.count > max) {
            res.set('Retry-After', String(Math.ceil(remainingMs / 1000)));
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMITED',
                    message: 'Too many attempts. Please try again later.'
                }
            });
        }
        return next();
    };
}

module.exports = { createRateLimiter };
