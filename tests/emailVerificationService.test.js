'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const postgres = require('../database/Postgres');

const state = { users: [], tokens: [] };
const now = () => new Date();

const fakePool = {
    async query(sql, values = []) {
        if (sql.includes('FROM chattbm_users WHERE email_normalized')) {
            const user = state.users.find(u =>
                u.email_normalized === values[0] && !u.disabled_at
            );
            return { rows: user ? [{
                id: user.id,
                email_normalized: user.email_normalized,
                email_verified_at: user.email_verified_at
            }] : [] };
        }
        throw new Error('Unexpected pool SQL: ' + sql);
    },
    async connect() {
        return {
            async query(sql, values = []) {
                if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
                    return { rows: [], rowCount: 0 };
                }
                if (sql.startsWith('SELECT id, email_verified_at FROM chattbm_users')) {
                    const user = state.users.find(u => u.id === values[0] && !u.disabled_at);
                    return { rows: user ? [{ id: user.id, email_verified_at: user.email_verified_at }] : [] };
                }
                if (sql.startsWith('UPDATE chattbm_email_verification_tokens SET used_at = NOW() WHERE user_id')) {
                    state.tokens.filter(t => t.user_id === values[0] && !t.used_at)
                        .forEach(t => { t.used_at = now(); });
                    return { rows: [], rowCount: 1 };
                }
                if (sql.startsWith('INSERT INTO chattbm_email_verification_tokens')) {
                    state.tokens.push({
                        id: values[0], user_id: values[1], token_hash: values[2],
                        expires_at: new Date(values[3]), used_at: null
                    });
                    return { rows: [], rowCount: 1 };
                }
                if (sql.startsWith('SELECT t.id, t.user_id FROM chattbm_email_verification_tokens')) {
                    const token = state.tokens.find(t =>
                        t.token_hash === values[0] && !t.used_at && t.expires_at > now()
                    );
                    const user = token && state.users.find(u => u.id === token.user_id && !u.disabled_at);
                    return { rows: token && user ? [{ id: token.id, user_id: token.user_id }] : [] };
                }
                if (sql.startsWith('UPDATE chattbm_email_verification_tokens SET used_at = NOW() WHERE id')) {
                    const token = state.tokens.find(t =>
                        t.id === values[0] && !t.used_at && t.expires_at > now()
                    );
                    if (token) token.used_at = now();
                    return { rows: token ? [{ user_id: token.user_id }] : [], rowCount: token ? 1 : 0 };
                }
                if (sql.startsWith('UPDATE chattbm_users SET email_verified_at')) {
                    const user = state.users.find(u => u.id === values[0] && !u.disabled_at);
                    if (user) user.email_verified_at = user.email_verified_at || now();
                    return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
                }
                throw new Error('Unexpected client SQL: ' + sql);
            },
            release() {}
        };
    }
};

postgres.getPool = () => fakePool;
const {
    createEmailVerification,
    redeemEmailVerification,
    hashVerificationToken,
    TOKEN_TTL_MS
} = require('../auth/EmailVerificationService');

test.beforeEach(() => {
    state.users.length = 0;
    state.tokens.length = 0;
    state.users.push({
        id: 'user-1',
        email_normalized: 'person@example.com',
        email_verified_at: null,
        disabled_at: null
    });
});

test('does not issue tokens for unknown, invalid, or already verified accounts', async () => {
    assert.equal(await createEmailVerification('missing@example.com'), null);
    assert.equal(await createEmailVerification('not-an-email'), null);
    state.users[0].email_verified_at = now();
    assert.equal(await createEmailVerification('person@example.com'), null);
    assert.equal(state.tokens.length, 0);
});

test('stores only a token digest and issues a short-lived token', async () => {
    const issued = await createEmailVerification(' PERSON@example.com ');
    assert.ok(issued);
    assert.equal(issued.email, 'person@example.com');
    assert.equal(state.tokens.length, 1);
    assert.notEqual(state.tokens[0].token_hash, issued.token);
    assert.equal(state.tokens[0].token_hash, hashVerificationToken(issued.token));
    assert.match(state.tokens[0].token_hash, /^[a-f0-9]{64}$/);
    assert.ok(state.tokens[0].expires_at.getTime() > Date.now());
    assert.ok(state.tokens[0].expires_at.getTime() <= Date.now() + TOKEN_TTL_MS + 1000);
});

test('redeems a verification token once and rejects reuse', async () => {
    const issued = await createEmailVerification('person@example.com');
    assert.deepEqual(await redeemEmailVerification(issued.token), { success: true });
    assert.ok(state.users[0].email_verified_at);
    assert.deepEqual(await redeemEmailVerification(issued.token), { success: false });
});

test('rejects malformed and expired tokens', async () => {
    assert.deepEqual(await redeemEmailVerification('short'), { success: false });
    const issued = await createEmailVerification('person@example.com');
    state.tokens[0].expires_at = new Date(Date.now() - 1000);
    assert.deepEqual(await redeemEmailVerification(issued.token), { success: false });
    assert.equal(state.users[0].email_verified_at, null);
});

test('new token invalidates the previous unused token', async () => {
    const first = await createEmailVerification('person@example.com');
    const second = await createEmailVerification('person@example.com');
    assert.ok(state.tokens[0].used_at);
    assert.deepEqual(await redeemEmailVerification(first.token), { success: false });
    assert.deepEqual(await redeemEmailVerification(second.token), { success: true });
});
