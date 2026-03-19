from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

from scripts.common.storage import load_json
from scripts.install_bundle import (
    BUNDLE_NAME,
    COPY_DIRS,
    bundle_root,
    config_path,
    default_openclaw_home,
    ensure_extra_skill_dir,
    ensure_runtime_dirs,
    install_bundle,
    load_or_init_config,
    verify_install,
)


REPO_ROOT = Path(__file__).resolve().parents[1]


class InstallBundleTests(unittest.TestCase):
    def test_default_openclaw_home_looks_correct(self) -> None:
        self.assertEqual(default_openclaw_home().name, ".openclaw")

    def test_load_or_init_config_defaults_and_validates(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "openclaw.json"
            self.assertEqual(load_or_init_config(path), {})
            path.write_text("[]", encoding="utf-8")
            with self.assertRaises(ValueError):
                load_or_init_config(path)

    def test_ensure_extra_skill_dir_is_idempotent(self) -> None:
        config = {}
        extra_dir = Path("/tmp/skills")
        ensure_extra_skill_dir(config, extra_dir)
        ensure_extra_skill_dir(config, extra_dir)
        self.assertEqual(config["skills"]["load"]["extraDirs"], [str(extra_dir)])

    def test_ensure_runtime_dirs_creates_namespaced_data_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir) / "bundle"
            ensure_runtime_dirs(root)
            for relative in (
                "longevityOS-data/nutrition",
                "longevityOS-data/health",
                "longevityOS-data/insights",
                "longevityOS-data/news",
            ):
                self.assertTrue((root / relative).is_dir())

    def test_install_bundle_copies_runtime_dirs_and_updates_config(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            openclaw_home = Path(tmp_dir) / ".openclaw"
            result = install_bundle(openclaw_home, dry_run=False)
            installed_root = bundle_root(openclaw_home, BUNDLE_NAME)

            self.assertEqual(Path(result["bundle_root"]), installed_root)
            for directory in COPY_DIRS:
                self.assertTrue((installed_root / directory).is_dir())
            for relative in (
                "longevityOS-data/nutrition",
                "longevityOS-data/health",
                "longevityOS-data/insights",
                "longevityOS-data/news",
            ):
                self.assertTrue((installed_root / relative).is_dir())

            config = load_json(config_path(openclaw_home), {})
            self.assertIn(
                str(installed_root / "skills"),
                config["skills"]["load"]["extraDirs"],
            )

    def test_install_bundle_script_supports_dry_run(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            openclaw_home = Path(tmp_dir) / ".openclaw"
            result = subprocess.run(
                [
                    sys.executable,
                    "scripts/install_bundle.py",
                    "--openclaw-home",
                    str(openclaw_home),
                    "--dry-run",
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("Dry run only. No files were changed.", result.stdout)
            self.assertFalse(bundle_root(openclaw_home, BUNDLE_NAME).exists())
            self.assertFalse(config_path(openclaw_home).exists())

    def test_verify_install_checks_ready_skills(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            openclaw_home = Path(tmp_dir) / ".openclaw"
            install_bundle(openclaw_home, dry_run=False)

            def fake_runner(cmd, check, capture_output, text):
                skill = cmd[-1]
                return subprocess.CompletedProcess(cmd, 0, stdout=f"{skill}\n✓ Ready\n", stderr="")

            result = verify_install(openclaw_home, runner=fake_runner)
            self.assertIn("skills", result)
            self.assertIn(str(bundle_root(openclaw_home, BUNDLE_NAME) / "skills"), result["extra_dirs"])
            self.assertIn("Ready", result["skills"]["snap"])
            self.assertIn("Ready", result["skills"]["daily-coach"])

    def test_verify_install_requires_registered_skills_dir(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            openclaw_home = Path(tmp_dir) / ".openclaw"
            bundle_dir = bundle_root(openclaw_home, BUNDLE_NAME)
            ensure_runtime_dirs(bundle_dir)
            (bundle_dir / "skills").mkdir(parents=True, exist_ok=True)
            load_json(config_path(openclaw_home), {})
            (openclaw_home / "openclaw.json").parent.mkdir(parents=True, exist_ok=True)
            (openclaw_home / "openclaw.json").write_text("{}", encoding="utf-8")
            with self.assertRaises(ValueError):
                verify_install(openclaw_home, runner=Mock())


if __name__ == "__main__":
    unittest.main()
