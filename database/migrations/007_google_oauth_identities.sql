-- ChatTBM migration: Google OAuth identity mapping.
-- Existing account and conversation records are not modified.
CREATE TABLE IF NOT EXISTS chattbm_oauth_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_subject),
    UNIQUE (user_id, provider)
);
