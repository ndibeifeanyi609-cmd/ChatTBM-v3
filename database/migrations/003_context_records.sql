-- ChatTBM migration 003: canonical durable Context records.
-- Additive and repeatable. Does not modify or delete legacy chat-history rows.
-- Context identity is unique per account and interaction; payload contains the
-- validated canonical Context object and is updated only through ContextBoundary.

CREATE TABLE IF NOT EXISTS chattbm_contexts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    interaction_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 1),
    schema_version TEXT NOT NULL,
    lifecycle TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT chattbm_contexts_user_interaction_unique
        UNIQUE (user_id, interaction_id)
);

CREATE INDEX IF NOT EXISTS chattbm_contexts_user_created_idx
    ON chattbm_contexts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS chattbm_contexts_user_updated_idx
    ON chattbm_contexts (user_id, updated_at DESC);
