'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const postgres = require('../database/Postgres');

const state = { users: [], tokens: [], sessions: [] };

function tokenHash(token) {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

const fakePool = {
    async query(sql, values = []) {
        if (sql.startsWith('SELECT id, email_normalized FROM chattbm_users')) {
            const user = state.users.find(item =>
                item.email_normalized === values[0] && !item.disabled_at
            );
            return { rows: user ? [{ id: user.id, email_normalized: user.email_normalized }] : [] };
        }
        if (sql.startsWith('UPDATE chattbm_password_reset_tokens SET used_at')) {
            for (const token of state.tokens) {
                if (token.user_id === values[0] && !token.used_at) token.used_at = new Date();
            }
            return { rows: [] };
        }
        if (sql.startsWith('INSERT INTO chattbm_password_reset_tokens')) {
            state.tokens.push({
                id: values[0], user_id: values[1], token_hash: values[2],
                expires_at: new Date(values[3]), used_at: null
            });
            return { rows: [] };
        }
        throw new Error('Unexpected pool SQL: ' + sql);
    },
    async connect() {
        return {
            async query(sql, values = []) {
                if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
                    return { rows: [] };
                }
                if (sql.startsWith('SELECT id, user_id FROM chattbm_password_reset_tokens')) {
                    const token = state.tokens.find(item =>
                        item.token_hash === values[0] && !item.used_at &&
                        item.expires_at > new Date()
                    );
                    return { rows: token ? [{ id: token.id, user_id: token.user_id }] : [] };
                }
                if (sql.startsWith('UPDATE chattbm_users SET password_hash')) {
                    const user = state.users.find(item => item.id === values[1] && !item.disabled_at);
                    if (user) user.password_hash = values[0];
                    return { rows: user ? [{ id: user.id }] : [] };
                }
                if (sql.startsWith('UPDATE chattbm_password_reset_tokens SET used_at')) {
                    for (const token of state.tokens) {
                        if (token.user_id === values[0] && !token.used_at) token.used_at = new Date();
                    }
                    return { rows: [] };
                }
                if (sql.startsWith('UPDATE chattbm_auth_sessions SET revoked_at')) {
                    for (const session of state.sessions) {
                        if (session.user_id === values[0] && !session.revoked_at) {
                            session.revoked_at = new Date();
                        }
                    }
                    return { rows: [] };
                }
                throw new Error('Unexpected client SQL: ' + sql);
            },
            release() {}
        };
    }
};

postgres.getPool = () => fakePool;
const { requestPasswordReset, resetPassword } = require('./PasswordResetService');

test.beforeEach(() => {
    state.users = [{ id: 'user-1', email_normalized: 'person@example.com', password_hash: 'old-hash', disabled_at: null }];
    state.tokens = [];
    state.sessions = [{ user_id: 'user-1', revoked_at: null }];
});

test('creates a hashed token for an existing account and returns a generic result for unknown email', async () => {
    const unknown = await requestPasswordReset('missing@example.com');
    assert.deepEqual(unknown, { success: true });
    assert.equal(state.tokens.length, 0);

    const result = await requestPasswordReset(' PERSON@example.com ');
    assert.equal(result.success, true);
    assert.equal(result.delivery.email, 'person@example.com');
    assert.equal(state.tokens.length, 1);
    assert.notEqual(state.tokens[0].token_hash, result.delivery.token);
    assert.equal(state.tokens[0].token_hash, tokenHash(result.delivery.token));
    assert.ok(state.tokens[0].expires_at > new Date());
});

test('changes password, consumes token, and revokes sessions', async () => {
    const issued = await requestPasswordReset('person@example.com');
    const result = await resetPassword(issued.delivery.token, 'a-strong-new-password');
    assert.deepEqual(result, { success: true });
    assert.notEqual(state.users[0].password_hash, 'old-hash');
    assert.ok(state.tokens[0].used_at);
    assert.ok(state.sessions[0].revoked_at);
});

test('rejects reuse and expired tokens', async () => {
    const issued = await requestPasswordReset('person@example.com');
    assert.equal((await resetPassword(issued.delivery.token, 'a-strong-new-password')).success, true);
    assert.equal((await resetPassword(issued.delivery.token, 'another-strong-password')).success, false);

    const next = await requestPasswordReset('person@example.com');
    state.tokens.find(item => item.token_hash === tokenHash(next.delivery.token)).expires_at = new Date(Date.now() - 1000);
    assert.equal((await resetPassword(next.delivery.token, 'yet-another-strong-password')).success, false);
});

test('rejects weak passwords without consuming a valid token', async () => {
    const issued = await requestPasswordReset('person@example.com');
    const result = await resetPassword(issued.delivery.token, 'short');
    assert.equal(result.success, false);
    assert.equal(state.tokens[0].used_at, null);
    assert.equal(state.users[0].password_hash, 'old-hash');
});
