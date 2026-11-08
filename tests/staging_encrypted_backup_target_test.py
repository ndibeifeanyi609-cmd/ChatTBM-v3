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
        self.args_log = root / "database-tool-args"
        self.passfile_log = root / "passfile-copy"
        self.mode_log = root / "passfile-mode"
        self.github_output = root / "github-output"
        self.aws_size_file = root / "aws-size"
        commands = {
            "psql": (
                '#!/bin/sh\n'
                'printf called >> "$PSQL_MARKER"\n'
                'printf "%s\\n" "$@" >> "$DB_ARGS_LOG"\n'
                'cp "$PGPASSFILE" "$PASSFILE_LOG"\n'
                'stat -c "%a" "$PGPASSFILE" > "$PASSFILE_MODE_LOG"\n'
                'printf "chattbm_staging_isolated\\n"\n'
            ),
            "pg_dump": (
                '#!/bin/sh\n'
                'printf "%s\\n" "$@" >> "$DB_ARGS_LOG"\n'
                'exit 0\n'
            ),
            "gpg": (
                '#!/bin/sh\n'
                'while [ "$#" -gt 0 ]; do '
                'if [ "$1" = "-o" ]; then shift; '
                'printf "fake encrypted test dump" > "$1"; exit 0; '
                'fi; shift; done\n'
                'exit 1\n'
            ),
            "aws": (
                '#!/bin/sh\\n'
                'if [ "$1" = "s3" ] && [ "$2" = "cp" ]; then\\n'
                '  size=$(wc -c < "$3" | tr -d "[:space:]")\\n'
                '  printf "%s\\\\n" "$size" > "$AWS_SIZE_FILE"\\n'
                '  exit 0\\n'
                'fi\\n'
                'if [ "$1" = "s3api" ] && [ "$2" = "head-object" ]; then\\n'
                '  cat "$AWS_SIZE_FILE"\\n'
                '  exit 0\\n'
                'fi\\n'
                'exit 1\\n'
            ),
        }
        for name, body in commands.items():
            path = bin_dir / name
            path.write_text(body, encoding="utf-8")
            path.chmod(0o755)
        self.env = os.environ.copy()
        self.env.update({
            "PATH": str(bin_dir) + os.pathsep + self.env.get("PATH", ""),
            "PSQL_MARKER": str(self.marker),
            "DB_ARGS_LOG": str(self.args_log),
            "PASSFILE_LOG": str(self.passfile_log),
            "PASSFILE_MODE_LOG": str(self.mode_log),
            "STAGING_BACKUP_DATABASE_URL": VALID_URL,
            "BACKUP_ENCRYPTION_PASSPHRASE": "test-only-passphrase",
            "R2_ACCESS_KEY_ID": "test-access-key",
            "R2_SECRET_ACCESS_KEY": "test-secret-key",
            "R2_ACCOUNT_ID": "00000000000000000000000000000000",
            "R2_BUCKET_NAME": "chattbm-staging-backups",
            "BACKUP_OUTPUT_DIR": str(root / "output"),
            "GITHUB_RUN_ID": "unit-test",
            "GITHUB_RUN_ATTEMPT": "1",
            "GITHUB_OUTPUT": str(self.github_output),
            "AWS_SIZE_FILE": str(self.aws_size_file),
        })

    def run_backup(self, url):
        self.env["STAGING_BACKUP_DATABASE_URL"] = url
        return subprocess.run(
            ["bash", str(SCRIPT)], env=self.env, text=True,
            capture_output=True, check=False,
        )

    def test_approved_url_uses_private_password_file_not_process_args(self):
        result = self.run_backup(VALID_URL)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(self.marker.exists())
        args = self.args_log.read_text(encoding="utf-8")
        self.assertNotIn("dummy-password", args)
        self.assertIn("backup_user@" + HOST, args)
        self.assertEqual(self.mode_log.read_text().strip(), "600")
        self.assertIn("dummy-password", self.passfile_log.read_text(encoding="utf-8"))
        self.assertFalse(self.env.get("PGPASSWORD"))

    def test_object_keys_use_128_bit_random_suffixes(self):
        first = self.run_backup(VALID_URL)
        self.assertEqual(first.returncode, 0, first.stderr)
        first_output = self.github_output.read_text(encoding="utf-8")
        first_key = next(line.split("=", 1)[1] for line in first_output.splitlines()
                         if line.startswith("backup_object_key="))

        self.github_output.unlink()
        second = self.run_backup(VALID_URL)
        self.assertEqual(second.returncode, 0, second.stderr)
        second_output = self.github_output.read_text(encoding="utf-8")
        second_key = next(line.split("=", 1)[1] for line in second_output.splitlines()
                          if line.startswith("backup_object_key="))

        import re
        pattern = r"^chattbm-staging-\d{8}T\d{6}Z-[0-9a-f]{32}\.dump\.gpg$"
        self.assertRegex(first_key, pattern)
        self.assertRegex(second_key, pattern)
        self.assertNotEqual(first_key, second_key)

    def test_checksum_and_size_outputs_match_encrypted_artifact(self):
        import hashlib

        result = self.run_backup(VALID_URL)
        self.assertEqual(result.returncode, 0, result.stderr)
        values = dict(
            line.split("=", 1)
            for line in self.github_output.read_text(encoding="utf-8").splitlines()
        )
        expected = b"fake encrypted test dump"
        self.assertEqual(values["backup_sha256"], hashlib.sha256(expected).hexdigest())
        self.assertEqual(int(values["backup_size_bytes"]), len(expected))
        self.assertTrue(values["backup_object_key"].endswith(".dump.gpg"))

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
                self.args_log.unlink(missing_ok=True)
                result = self.run_backup(url)
                self.assertNotEqual(result.returncode, 0, label)
                self.assertFalse(self.marker.exists(), f"Rejected URL reached psql: {label}")


if __name__ == "__main__":
    unittest.main()
