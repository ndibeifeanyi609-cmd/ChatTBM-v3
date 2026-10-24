-- Shared authentication rate-limit buckets.
-- Apply only through the reviewed schema procedure; never run against production ad hoc.
CREATE TABLE IF NOT EXISTS chattbm_auth_rate_limits (
    bucket_key TEXT PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL CHECK (request_count >= 1),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chattbm_auth_rate_limits_expires_at_idx
    ON chattbm_auth_rate_limits (expires_at);
