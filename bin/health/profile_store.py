from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from bin.common.paths import default_data_root
from bin.common.storage import load_json, utc_now_iso, write_json


def profile_path(data_root: Path) -> Path:
    return data_root / "health" / "profile.json"


def default_profile() -> dict[str, Any]:
    return {
        "updated_at": None,
        "goals": [],
        "constraints": [],
        "preferences": {},
        "questionnaire": {},
        "whoop": {},
        "imports": [],
    }


def merge_questionnaire(profile: dict[str, Any], answers: dict[str, Any]) -> dict[str, Any]:
    for key in ("goals", "constraints"):
        if key in answers:
            profile[key] = answers[key]
    for key in ("preferences", "questionnaire"):
        if key in answers and isinstance(answers[key], dict):
            profile.setdefault(key, {})
            profile[key].update(answers[key])
    for key in ("sleep_notes", "training_notes", "diet_notes"):
        if key in answers:
            profile["questionnaire"][key] = answers[key]
    profile["updated_at"] = utc_now_iso()
    return profile


def merge_import(profile: dict[str, Any], import_summary: dict[str, Any]) -> dict[str, Any]:
    profile["whoop"] = import_summary
    profile.setdefault("imports", [])
    profile["imports"].append(
        {
            "source": import_summary.get("source", "unknown"),
            "imported_at": import_summary.get("imported_at", utc_now_iso()),
            "file_name": import_summary.get("file_name"),
        }
    )
    profile["updated_at"] = utc_now_iso()
    return profile


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("input must be a JSON object")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Merge health data into profile.json.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    subparsers = parser.add_subparsers(dest="command", required=True)

    questionnaire_parser = subparsers.add_parser("merge-questionnaire")
    questionnaire_parser.add_argument("--input-json", type=Path, required=True)

    import_parser = subparsers.add_parser("merge-import")
    import_parser.add_argument("--input-json", type=Path, required=True)

    subparsers.add_parser("show")

    args = parser.parse_args()
    path = profile_path(args.data_root)
    profile = load_json(path, default_profile())

    if args.command == "merge-questionnaire":
        profile = merge_questionnaire(profile, read_json(args.input_json))
        write_json(path, profile)
        result = profile
    elif args.command == "merge-import":
        profile = merge_import(profile, read_json(args.input_json))
        write_json(path, profile)
        result = profile
    else:
        result = profile

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
