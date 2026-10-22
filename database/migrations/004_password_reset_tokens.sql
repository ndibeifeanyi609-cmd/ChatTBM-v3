-- Password-reset token storage.
-- Apply only to the database configured by DATABASE_URL after review.
-- Raw tokens must never be stored; store SHA-256 digests only.
CREATE TABLE IF NOT EXISTS chattbm_password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chattbm_password_reset_tokens_user_created_idx
    ON chattbm_password_reset_tokens (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS chattbm_password_reset_tokens_expires_idx
    ON chattbm_password_reset_tokens (expires_at);
