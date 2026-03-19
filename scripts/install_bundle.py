from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from scripts.common.paths import ensure_dir, repo_root
from scripts.common.storage import write_json


SKILLS = ["snap", "health", "news", "insights"]
BUNDLE_NAME = "compound-clawskill"
DATA_DIR_NAME = "longevityOS-data"
COPY_DIRS = ["skills", "scripts", "cron", "docs"]


def default_openclaw_home() -> Path:
    return Path.home() / ".openclaw"


def bundle_root(openclaw_home: Path, bundle_name: str = BUNDLE_NAME) -> Path:
    return openclaw_home / "bundles" / bundle_name


def config_path(openclaw_home: Path) -> Path:
    return openclaw_home / "openclaw.json"


def load_or_init_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return payload


def ensure_extra_skill_dir(config: dict[str, Any], extra_dir: Path) -> dict[str, Any]:
    skills = config.setdefault("skills", {})
    load = skills.setdefault("load", {})
    extra_dirs = load.setdefault("extraDirs", [])
    extra_dir_str = str(extra_dir)
    if extra_dir_str not in extra_dirs:
        extra_dirs.append(extra_dir_str)
    return config


def ensure_runtime_dirs(bundle_dir: Path) -> None:
    for relative in (
        "longevityOS-data/nutrition",
        "longevityOS-data/health",
        "longevityOS-data/insights",
        "longevityOS-data/news",
    ):
        ensure_dir(bundle_dir / relative)


def copy_bundle_contents(src_root: Path, dst_root: Path) -> None:
    ensure_dir(dst_root)
    for directory in COPY_DIRS:
        source = src_root / directory
        target = dst_root / directory
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(source, target)

    ensure_runtime_dirs(dst_root)


def install_bundle(openclaw_home: Path, bundle_name: str = BUNDLE_NAME, dry_run: bool = False) -> dict[str, str]:
    src_root = repo_root()
    dst_root = bundle_root(openclaw_home, bundle_name)
    skills_dir = dst_root / "skills"
    cfg_path = config_path(openclaw_home)
    cfg = ensure_extra_skill_dir(load_or_init_config(cfg_path), skills_dir)

    if not dry_run:
        ensure_dir(openclaw_home)
        copy_bundle_contents(src_root, dst_root)
        write_json(cfg_path, cfg)

    return {
        "openclaw_home": str(openclaw_home),
        "bundle_root": str(dst_root),
        "skills_dir": str(skills_dir),
        "config_path": str(cfg_path),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Install this bundle into ~/.openclaw/bundles and register extraDirs."
    )
    parser.add_argument("--openclaw-home", type=Path, default=default_openclaw_home())
    parser.add_argument("--bundle-name", default=BUNDLE_NAME)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    result = install_bundle(
        openclaw_home=args.openclaw_home.expanduser().resolve(),
        bundle_name=args.bundle_name,
        dry_run=args.dry_run,
    )

    if args.dry_run:
        print("Dry run only. No files were changed.")
    print("Bundle installation summary:")
    print(f"- OpenClaw home: {result['openclaw_home']}")
    print(f"- Bundle root: {result['bundle_root']}")
    print(f"- Skills dir added to extraDirs: {result['skills_dir']}")
    print(f"- Config path: {result['config_path']}")
    print("")
    print("Next:")
    print("1. Start a new OpenClaw session so the skill snapshot refreshes.")
    print("2. Add the cron jobs from the installed cron/ directory using your Telegram DM chat id.")
    print("3. Verify /snap, /health, /news, and /insights are visible.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
