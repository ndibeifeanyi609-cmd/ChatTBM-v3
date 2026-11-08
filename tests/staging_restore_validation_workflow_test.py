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
        self.assertIn("required: true", self.text)

    def test_only_approved_bucket_and_read_only_named_credentials(self):
        self.assertIn('R2_BUCKET_NAME == "chattbm-staging-backups"', self.text)
        self.assertIn("R2_READ_ACCESS_KEY_ID", self.text)
        self.assertIn("R2_READ_SECRET_ACCESS_KEY", self.text)
        self.assertNotIn("secrets.R2_ACCESS_KEY_ID", self.text)
        self.assertNotIn("secrets.R2_SECRET_ACCESS_KEY", self.text)

    def test_never_receives_a_render_database_connection(self):
        for forbidden in ("STAGING_DATABASE_URL", "DATABASE_URL", "STAGING_BACKUP_DATABASE_URL"):
            self.assertNotIn(forbidden, self.text)

    def test_checksum_is_checked_before_decryption(self):
        checksum = self.text.index("actual_sha256=$(sha256sum")
        decrypt = self.text.index("gpg --batch")
        self.assertLess(checksum, decrypt)
        self.assertIn('[[ "$EXPECTED_SHA256" =~ ^[0-9a-f]{64}$ ]]', self.text)

    def test_object_key_is_strictly_validated(self):
        self.assertRegex(self.text, re.compile(r"BACKUP_OBJECT_KEY.*"))
        self.assertIn(r"\\.dump\\.gpg$", self.text)
        self.assertIn("chattbm-staging-", self.text)

    def test_restore_target_is_disposable_postgres_18(self):
        self.assertIn("image: postgres:18-alpine", self.text)
        self.assertIn("--dbname=restore_validation", self.text)
        self.assertNotIn("--host=", self.text.split("pg_restore", 1)[1].splitlines()[0])

    def test_local_artifacts_are_removed_even_after_failed_steps(self):
        self.assertIn("if: always()", self.text)
        self.assertIn("rm -f", self.text)


if __name__ == "__main__":
    unittest.main()
