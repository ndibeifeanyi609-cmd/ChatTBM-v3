-- ChatTBM email-verification token storage.
-- Proposal only: do not apply to production until migration history and runner
-- compatibility have been independently reviewed.

CREATE TABLE IF NOT EXISTS chattbm_email_verification_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chattbm_email_verification_tokens_user_id_idx
    ON chattbm_email_verification_tokens (user_id);

CREATE INDEX IF NOT EXISTS chattbm_email_verification_tokens_expires_at_idx
    ON chattbm_email_verification_tokens (expires_at);

CREATE INDEX IF NOT EXISTS chattbm_email_verification_tokens_active_user_idx
    ON chattbm_email_verification_tokens (user_id)
    WHERE used_at IS NULL;
