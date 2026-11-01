-- One-time server-side OAuth state avoids relying on cross-site cookies.
-- State values are stored as hashes and expire quickly.
CREATE TABLE IF NOT EXISTS chattbm_google_oauth_states (
    state_hash TEXT PRIMARY KEY,
    link_user_id TEXT REFERENCES chattbm_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chattbm_google_oauth_states_expires_at_idx
ON chattbm_google_oauth_states (expires_at);
