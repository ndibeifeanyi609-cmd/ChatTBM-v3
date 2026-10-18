-- ChatTBM migration 002: server-backed chat message history.
CREATE TABLE IF NOT EXISTS chattbm_chat_history (
    user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    messages JSONB NOT NULL CHECK (jsonb_typeof(messages) = 'array'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, conversation_id)
);
CREATE INDEX IF NOT EXISTS chattbm_chat_history_updated_at_idx
    ON chattbm_chat_history (user_id, updated_at DESC);
