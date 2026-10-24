'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const postgres = require('../database/Postgres');

const state = { users: [], resets: [], sessions: [] };
const fakePool = {
    async query(sql, values = []) {
        if (sql.includes('FROM chattbm_users WHERE email_normalized')) {
            const user = state.users.find(u => u.email_normalized === values[0] && !u.disabled_at);
            return { rows: user ? [{ id: user.id, email_normalized: user.email_normalized }] : [] };
        }
        throw new Error('Unexpected pool SQL: ' + sql);
    },
    async connect() {
        return {
            async query(sql, values = []) {
                if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
                if (sql.startsWith('SELECT id FROM chattbm_users WHERE id')) {
                    const user = state.users.find(u => u.id === values[0] && !u.disabled_at);
                    return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
                }
                if (sql.startsWith('UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE user_id')) {
                    state.resets.filter(t => t.user_id === values[0] && !t.used_at).forEach(t => { t.used_at = new Date(); });
                    return { rows: [], rowCount: 1 };
                }
                if (sql.startsWith('INSERT INTO chattbm_password_reset_tokens')) {
                    state.resets.push({ id: values[0], user_id: values[1], token_hash: values[2], expires_at: new Date(values[3]), used_at: null });
                    return { rows: [], rowCount: 1 };
                }
                if (sql.startsWith('SELECT id, user_id FROM chattbm_password_reset_tokens')) {
                    const token = state.resets.find(t => t.token_hash === values[0] && !t.used_at && t.expires_at > new Date());
                    return { rows: token ? [{ id: token.id, user_id: token.user_id }] : [] };
                }
                if (sql.startsWith('UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE id')) {
                    const token = state.resets.find(t => t.id === values[0] && !t.used_at && t.expires_at > new Date());
                    if (token) token.used_at = new Date();
                    return { rows: token ? [{ user_id: token.user_id }] : [], rowCount: token ? 1 : 0 };
                }
                if (sql.startsWith('UPDATE chattbm_users SET password_hash')) {
                    const user = state.users.find(u => u.id === values[1] && !u.disabled_at);
                    if (user) user.password_hash = values[0];
                    return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
                }
                if (sql.startsWith('UPDATE chattbm_auth_sessions SET revoked_at')) {
                    state.sessions.filter(s => s.user_id === values[0] && !s.revoked_at).forEach(s => { s.revoked_at = new Date(); });
                    return { rows: [], rowCount: 1 };
                }
                throw new Error('Unexpected client SQL: ' + sql);
            },
            release() {}
        };
    }
};

postgres.getPool = () => fakePool;
const { createPasswordReset, redeemPasswordReset } = require('../auth/PasswordResetService');
const { verifyPassword } = require('../auth/AuthCrypto');

test.beforeEach(() => {
    state.users.length = 0;
    state.resets.length = 0;
    state.sessions.length = 0;
    state.users.push({ id: 'user-1', email_normalized: 'person@example.com', password_hash: 'old-hash', disabled_at: null });
});

test('does not create reset tokens for unknown accounts', async () => {
    assert.equal(await createPasswordReset('missing@example.com'), null);
    assert.equal(state.resets.length, 0);
});

test('stores only a token digest and allows a reset token once', async () => {
    const reset = await createPasswordReset(' PERSON@example.com ');
    assert.ok(reset);
    assert.equal(reset.email, 'person@example.com');
    assert.equal(state.resets.length, 1);
    assert.notEqual(state.resets[0].token_hash, reset.token);
    assert.match(state.resets[0].token_hash, /^[a-f0-9]{64}$/);
    state.sessions.push({ user_id: 'user-1', revoked_at: null }, { user_id: 'another-user', revoked_at: null });
    const changed = await redeemPasswordReset(reset.token, 'new-correct-password-123');
    assert.deepEqual(changed, { success: true });
    assert.equal(await verifyPassword('new-correct-password-123', state.users[0].password_hash), true);
    assert.ok(state.sessions[0].revoked_at);
    assert.equal(state.sessions[1].revoked_at, null);
    assert.deepEqual(await redeemPasswordReset(reset.token, 'another-correct-password-456'), { success: false });
});

test('rejects invalid passwords and expired reset tokens', async () => {
    assert.deepEqual(await redeemPasswordReset('valid-looking-token-12345678901234567890', 'short'), { success: false });
    const reset = await createPasswordReset('person@example.com');
    state.resets[0].expires_at = new Date(Date.now() - 1000);
    assert.deepEqual(await redeemPasswordReset(reset.token, 'new-correct-password-123'), { success: false });
});
