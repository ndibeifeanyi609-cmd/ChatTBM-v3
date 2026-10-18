-- ChatTBM database migration 001: account and session foundations.
-- Safe to run repeatedly; existing conversation data is not modified.

CREATE TABLE IF NOT EXISTS chattbm_users (
    id TEXT PRIMARY KEY,
    email_normalized TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disabled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chattbm_auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chattbm_auth_sessions_user_id_idx
    ON chattbm_auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS chattbm_auth_sessions_expires_at_idx
    ON chattbm_auth_sessions (expires_at);
