import os
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "staging-encrypted-backup.sh"
HOST = "dpg-dbicflmc6qcc73d97u60-a"
DATABASE = "chattbm_staging_isolated"
VALID_URL = f"postgresql://backup_user:dummy-password@{HOST}/{DATABASE}"


class StagingBackupTargetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        bin_dir = root / "bin"
        bin_dir.mkdir()
        self.marker = root / "psql-called"
        commands = {
            "psql": '#!/bin/sh\nprintf called >> "$PSQL_MARKER"\nprintf "chattbm_staging_isolated\\n"\n',
            "pg_dump": "#!/bin/sh\nexit 0\n",
            "gpg": '#!/bin/sh\nwhile [ "$#" -gt 0 ]; do if [ "$1" = "-o" ]; then shift; : > "$1"; exit 0; fi; shift; done\nexit 1\n',
            "aws": "#!/bin/sh\nexit 0\n",
        }
        for name, body in commands.items():
            path = bin_dir / name
            path.write_text(body, encoding="utf-8")
            path.chmod(0o755)
        self.env = os.environ.copy()
        self.env.update({
            "PATH": str(bin_dir) + os.pathsep + self.env.get("PATH", ""),
            "PSQL_MARKER": str(self.marker),
            "STAGING_BACKUP_DATABASE_URL": VALID_URL,
            "BACKUP_ENCRYPTION_PASSPHRASE": "test-only-passphrase",
            "R2_ACCESS_KEY_ID": "test-access-key",
            "R2_SECRET_ACCESS_KEY": "test-secret-key",
            "R2_ACCOUNT_ID": "00000000000000000000000000000000",
            "R2_BUCKET_NAME": "chattbm-staging-backups",
            "BACKUP_OUTPUT_DIR": str(root / "output"),
            "GITHUB_RUN_ID": "unit-test",
            "GITHUB_RUN_ATTEMPT": "1",
        })

    def run_backup(self, url):
        self.env["STAGING_BACKUP_DATABASE_URL"] = url
        return subprocess.run(
            ["bash", str(SCRIPT)], env=self.env, text=True,
            capture_output=True, check=False,
        )

    def test_approved_internal_staging_url_reaches_psql(self):
        result = self.run_backup(VALID_URL)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(self.marker.exists())

    def test_rejected_urls_never_reach_psql(self):
        invalid_urls = {
            "external Render hostname": f"postgresql://user:pass@dpg-external.example.com/{DATABASE}",
            "wrong database": f"postgresql://user:pass@{HOST}/production",
            "wrong port": f"postgresql://user:pass@{HOST}:5433/{DATABASE}",
            "wrong scheme": f"mysql://user:pass@{HOST}/{DATABASE}",
            "missing username": f"postgresql://:pass@{HOST}/{DATABASE}",
            "missing password": f"postgresql://user@{HOST}/{DATABASE}",
            "query string": VALID_URL + "?sslmode=require",
            "fragment": VALID_URL + "#unexpected",
            "malformed URL": "not-a-database-url",
            "invalid port": f"postgresql://user:pass@{HOST}:notaport/{DATABASE}",
            "empty URL": "",
        }
        for label, url in invalid_urls.items():
            with self.subTest(label=label):
                self.marker.unlink(missing_ok=True)
                result = self.run_backup(url)
                self.assertNotEqual(result.returncode, 0, label)
                self.assertFalse(self.marker.exists(), f"Rejected URL reached psql: {label}")


if __name__ == "__main__":
    unittest.main()
