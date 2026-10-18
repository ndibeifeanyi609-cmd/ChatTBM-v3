'use strict';

const {
    createHash,
    randomBytes,
    scrypt: scryptCallback,
    timingSafeEqual
} = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;

function normalizeEmail(value) {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
}

function validatePassword(value) {
    return typeof value === 'string' &&
        value.length >= 12 &&
        value.length <= 1024;
}

async function hashPassword(password) {
    if (!validatePassword(password)) {
        throw new TypeError('Password must contain between 12 and 1024 characters.');
    }

    const salt = randomBytes(16);
    const derived = await scrypt(password, salt, KEY_LENGTH, {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: SCRYPT_MAXMEM
    });

    return [
        'scrypt',
        SCRYPT_N,
        SCRYPT_R,
        SCRYPT_P,
        salt.toString('base64url'),
        Buffer.from(derived).toString('base64url')
    ].join('$');
}

async function verifyPassword(password, encoded) {
    if (typeof password !== 'string' || typeof encoded !== 'string') {
        return false;
    }

    const parts = encoded.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

    const n = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    if (
        !Number.isInteger(n) || n < 16384 || n > 32768 ||
        !Number.isInteger(r) || r !== 8 ||
        !Number.isInteger(p) || p !== 1
    ) return false;

    let salt;
    let expected;
    try {
        salt = Buffer.from(parts[4], 'base64url');
        expected = Buffer.from(parts[5], 'base64url');
    } catch (_) {
        return false;
    }
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;

    try {
        const actual = Buffer.from(await scrypt(password, salt, KEY_LENGTH, {
            N: n,
            r,
            p,
            maxmem: SCRYPT_MAXMEM
        }));
        return timingSafeEqual(actual, expected);
    } catch (_) {
        return false;
    }
}

function createSessionToken() {
    return randomBytes(32).toString('base64url');
}

function hashSessionToken(token) {
    if (typeof token !== 'string' || token.length < 32 || token.length > 256) {
        throw new TypeError('Session token is invalid.');
    }
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

module.exports = {
    normalizeEmail,
    validatePassword,
    hashPassword,
    verifyPassword,
    createSessionToken,
    hashSessionToken
};
