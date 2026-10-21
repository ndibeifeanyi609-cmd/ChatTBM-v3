-- ChatTBM password-reset tokens. Store only token hashes; raw tokens exist only in emailed links.
CREATE TABLE IF NOT EXISTS chattbm_password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS chattbm_password_reset_user_idx
    ON chattbm_password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS chattbm_password_reset_expiry_idx
    ON chattbm_password_reset_tokens (expires_at);
