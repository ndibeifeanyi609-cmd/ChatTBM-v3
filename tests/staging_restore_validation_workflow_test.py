import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "staging-restore-validation.yml"


class StagingRestoreWorkflowSafetyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = WORKFLOW.read_text(encoding="utf-8")

    def test_manual_dispatch_requires_object_key_and_checksum(self):
        self.assertIn("workflow_dispatch:", self.text)
        self.assertIn("backup_object_key:", self.text)
        self.assertIn("expected_sha256:", self.text)
        self.assertIn("expected_size_bytes:", self.text)
        self.assertIn("required: true", self.text)

    def test_only_approved_bucket_and_read_only_named_credentials(self):
        self.assertIn('[[ "$R2_BUCKET_NAME" == "chattbm-staging-backups" ]]', self.text)
        self.assertIn("R2_READ_ACCESS_KEY_ID", self.text)
        self.assertIn("R2_READ_SECRET_ACCESS_KEY", self.text)
        self.assertNotIn("secrets.R2_ACCESS_KEY_ID", self.text)
        self.assertNotIn("secrets.R2_SECRET_ACCESS_KEY", self.text)

    def test_never_receives_a_render_database_connection(self):
        for forbidden in ("STAGING_DATABASE_URL", "DATABASE_URL", "STAGING_BACKUP_DATABASE_URL"):
            self.assertNotIn(forbidden, self.text)

    def test_size_and_checksum_are_checked_before_decryption(self):
        size_check = self.text.index("actual_size_bytes=$(wc -c")
        checksum = self.text.index("actual_sha256=$(sha256sum")
        decrypt = self.text.index("gpg --batch", self.text.index("Decrypt and restore"))
        self.assertLess(size_check, checksum)
        self.assertLess(checksum, decrypt)
        self.assertIn('[[ "$EXPECTED_SHA256" =~ ^[0-9a-f]{64}$ ]]', self.text)
        self.assertIn('[[ "$EXPECTED_SIZE_BYTES" =~ ^[1-9][0-9]*$ ]]', self.text)
        self.assertIn('if [[ "$actual_size_bytes" != "$EXPECTED_SIZE_BYTES" ]]', self.text)

    def test_object_key_is_strictly_validated(self):
        self.assertRegex(self.text, re.compile(r"BACKUP_OBJECT_KEY.*"))
        self.assertIn(r"\.dump\.gpg$", self.text)
        self.assertIn("chattbm-staging-", self.text)

    def test_restore_target_is_disposable_postgres_18(self):
        self.assertIn("image: postgres:18-alpine", self.text)
        self.assertIn("--dbname=restore_validation", self.text)
        self.assertIn("--host=127.0.0.1", self.text)
        self.assertNotIn("dpg-dbicflmc6qcc73d97u60-a", self.text)

    def test_restore_requires_named_core_chat_tbm_tables(self):
        for table in (
            "chattbm_users",
            "chattbm_auth_sessions",
            "chattbm_conversations",
            "chattbm_contexts",
            "chattbm_chat_history",
            "chattbm_memories",
            "chattbm_oauth_identities",
            "chattbm_google_oauth_states",
            "chattbm_google_oauth_handoffs",
        ):
            self.assertIn(table, self.text)
        self.assertIn("to_regclass(", self.text)
        self.assertIn('if [[ -n "$missing_tables" ]]', self.text)
        self.assertIn('echo "ERROR: Restore is missing required ChatTBM tables:"', self.text)
        self.assertIn("exit 1", self.text)
        self.assertIn("missing_columns=$(psql", self.text)
        self.assertIn("information_schema.columns", self.text)
        self.assertIn("required.column_name", self.text)
        self.assertIn('if [[ -n "$missing_columns" ]]', self.text)
        self.assertIn('echo "ERROR: Restore is missing required ChatTBM columns:"', self.text)
        self.assertIn("missing_constraints=$(psql", self.text)
        self.assertIn("pg_constraint actual", self.text)
        self.assertIn("pg_get_constraintdef(actual.oid)", self.text)
        self.assertIn("'p','primary key", self.text)
        self.assertIn("'u','unique", self.text)
        self.assertIn("'f','foreign key", self.text)
        self.assertIn('if [[ -n "$missing_constraints" ]]', self.text)
        self.assertIn('echo "ERROR: Restore is missing required ChatTBM keys or foreign-key constraints:"', self.text)
        self.assertIn("missing_indexes=$(psql", self.text)
        self.assertIn("pg_indexes actual", self.text)
        self.assertIn("actual.indexdef", self.text)
        self.assertIn("on public.chattbm_contexts using btree (user_id, created_at desc)", self.text)
        self.assertIn("on public.chattbm_contexts using btree (user_id, updated_at desc)", self.text)
        self.assertIn("on public.chattbm_memories using btree (user_id, lifecycle)", self.text)
        self.assertIn("chattbm_contexts_user_created_idx", self.text)
        self.assertIn("chattbm_memories_user_lifecycle_idx", self.text)
        self.assertIn('if [[ -n "$missing_indexes" ]]', self.text)
        self.assertIn("missing_checks=$(psql", self.text)
        self.assertIn("jsonb_typeof(payload)", self.text)
        self.assertIn("jsonb_typeof(messages)", self.text)
        self.assertIn("pg_get_expr(actual.conbin, actual.conrelid)", self.text)
        self.assertIn("('chattbm_contexts','version >= 1')", self.text)
        self.assertIn("expression_fragment", self.text)
        self.assertIn("version >= 1", self.text)
        self.assertIn("object", self.text)
        self.assertIn("array", self.text)
        self.assertIn("actual.contype = 'c'", self.text)
        self.assertIn('if [[ -n "$missing_checks" ]]', self.text)
        self.assertNotIn("count(*) FROM information_schema.tables", self.text)

    def test_passphrase_uses_private_file_and_is_cleaned(self):
        self.assertIn('passphrase_file="/tmp/staging-backup.passphrase"', self.text)
        self.assertIn('chmod 600 "$passphrase_file"', self.text)
        self.assertIn('--passphrase-file "$passphrase_file"', self.text)
        self.assertNotIn("--passphrase-fd", self.text)
        self.assertNotIn("<<<", self.text)
        self.assertIn('"$passphrase_file"', self.text)

    def test_local_artifacts_are_removed_even_after_failed_steps(self):
        self.assertIn("if: always()", self.text)
        self.assertIn("rm -f /tmp/staging-backup.dump.gpg /tmp/staging-backup.dump", self.text)
        self.assertIn('"$passphrase_file"', self.text)

if __name__ == "__main__":
    unittest.main()
