from __future__ import annotations

import argparse
import csv
import json
import sys
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import load_json, utc_now_iso, write_json


def experiments_path(data_root: Path) -> Path:
    return data_root / "insights" / "experiments.json"


def checkins_path(data_root: Path) -> Path:
    return data_root / "insights" / "checkins.json"


def profile_path(data_root: Path) -> Path:
    return data_root / "health" / "profile.json"


def meals_path(data_root: Path) -> Path:
    return data_root / "nutrition" / "meals.csv"


def default_experiments() -> dict[str, Any]:
    return {"active_experiment_id": None, "items": []}


def default_checkins() -> list[dict[str, Any]]:
    return []


def load_input(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("input payload must be a JSON object")
    return payload


def count_meal_days(data_root: Path) -> int:
    path = meals_path(data_root)
    if not path.exists():
        return 0
    days: set[str] = set()
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if row.get("date"):
                days.add(row["date"])
    return len(days)


def create_experiment(data_root: Path, payload: dict[str, Any]) -> dict[str, Any]:
    required = ["title", "domain", "hypothesis", "null_hypothesis", "intervention", "primary_outcome"]
    missing = [key for key in required if not payload.get(key)]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")

    experiments = load_json(experiments_path(data_root), default_experiments())
    item = {
        "id": str(payload.get("id") or uuid.uuid4()),
        "title": payload["title"],
        "domain": payload["domain"],
        "hypothesis": payload["hypothesis"],
        "null_hypothesis": payload["null_hypothesis"],
        "intervention": payload["intervention"],
        "primary_outcome": payload["primary_outcome"],
        "secondary_outcomes": payload.get("secondary_outcomes", []),
        "baseline_window": payload.get("baseline_window", "7d"),
        "intervention_window": payload.get("intervention_window", "14d"),
        "checkin_questions": payload.get("checkin_questions", []),
        "status": payload.get("status", "active"),
        "created_at": utc_now_iso(),
        "started_at": payload.get("started_at") or utc_now_iso(),
        "ended_at": payload.get("ended_at"),
        "analysis_summary": payload.get("analysis_summary", ""),
        "next_action": payload.get("next_action", ""),
    }
    experiments["items"].append(item)
    experiments["active_experiment_id"] = item["id"]
    write_json(experiments_path(data_root), experiments)
    return item


def add_checkin(data_root: Path, payload: dict[str, Any]) -> dict[str, Any]:
    required = ["experiment_id", "compliance", "primary_outcome_scores"]
    missing = [key for key in required if key not in payload]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")
    if not isinstance(payload["primary_outcome_scores"], dict):
        raise ValueError("primary_outcome_scores must be an object")
    entry = {
        "id": str(uuid.uuid4()),
        "experiment_id": payload["experiment_id"],
        "timestamp": payload.get("timestamp") or utc_now_iso(),
        "compliance": payload["compliance"],
        "primary_outcome_scores": payload["primary_outcome_scores"],
        "confounders": payload.get("confounders", []),
        "note": payload.get("note", ""),
    }
    checkins = load_json(checkins_path(data_root), default_checkins())
    checkins.append(entry)
    write_json(checkins_path(data_root), checkins)
    return entry


def analyze_experiment(data_root: Path, experiment_id: str) -> dict[str, Any]:
    experiments = load_json(experiments_path(data_root), default_experiments())
    items = {item["id"]: item for item in experiments["items"]}
    if experiment_id not in items:
        raise ValueError(f"unknown experiment id: {experiment_id}")

    checkins = load_json(checkins_path(data_root), default_checkins())
    relevant = [item for item in checkins if item.get("experiment_id") == experiment_id]
    outcome_values: dict[str, list[float]] = defaultdict(list)
    compliance_values: list[float] = []
    for checkin in relevant:
        compliance_values.append(float(checkin.get("compliance", 0)))
        for key, value in checkin.get("primary_outcome_scores", {}).items():
            outcome_values[key].append(float(value))

    averages = {
        key: round(sum(values) / len(values), 2)
        for key, values in outcome_values.items()
        if values
    }
    compliance_avg = round(sum(compliance_values) / len(compliance_values), 2) if compliance_values else 0.0
    return {
        "experiment": items[experiment_id],
        "checkin_count": len(relevant),
        "average_primary_outcomes": averages,
        "average_compliance": compliance_avg,
        "status": "needs-more-data" if len(relevant) < 3 else "ready-for-review",
    }


def gap_report(data_root: Path) -> dict[str, Any]:
    profile = load_json(profile_path(data_root), {})
    experiments = load_json(experiments_path(data_root), default_experiments())
    active_experiment_id = experiments.get("active_experiment_id")
    meal_days = count_meal_days(data_root)
    missing: list[str] = []

    if meal_days < 3:
        missing.append("Log at least 3 days of meals before asking for diet-linked insights.")
    if not profile.get("questionnaire"):
        missing.append("Complete the structured /health questionnaire.")
    if not profile.get("whoop"):
        missing.append("Connect Whoop to import sleep/recovery/strain context.")

    if active_experiment_id:
        analysis = analyze_experiment(data_root, active_experiment_id)
        if analysis["checkin_count"] < 3:
            missing.append("Record at least 3 experiment check-ins before reviewing results.")

    return {
        "ready": not missing,
        "missing_data": missing,
        "meal_days_logged": meal_days,
        "has_health_profile": bool(profile.get("questionnaire") or profile.get("whoop")),
        "active_experiment_id": active_experiment_id,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage /insights experiments.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create")
    create_parser.add_argument("--input-json", type=Path, required=True)

    checkin_parser = subparsers.add_parser("checkin")
    checkin_parser.add_argument("--input-json", type=Path, required=True)

    analyze_parser = subparsers.add_parser("analyze")
    analyze_parser.add_argument("--experiment-id", required=True)

    subparsers.add_parser("gap-report")

    args = parser.parse_args()
    if args.command == "create":
        result = create_experiment(args.data_root, load_input(args.input_json))
    elif args.command == "checkin":
        result = add_checkin(args.data_root, load_input(args.input_json))
    elif args.command == "analyze":
        result = analyze_experiment(args.data_root, args.experiment_id)
    else:
        result = gap_report(args.data_root)

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
