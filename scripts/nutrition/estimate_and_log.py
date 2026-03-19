from __future__ import annotations

import argparse
import csv
import json
import sys
import uuid
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import append_csv_rows, utc_now_iso
from scripts.nutrition.lookup import enrich_ingredient


FIELDNAMES = [
    "timestamp",
    "date",
    "meal_id",
    "meal_type",
    "source",
    "ingredient_name",
    "normalized_name",
    "amount_g",
    "portion_text",
    "calories_kcal",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
    "micronutrients_json",
    "nutrient_source",
    "ingredient_confidence",
    "meal_confidence",
    "notes",
    "photo_ref",
]


def load_payload(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("payload must be a JSON object")
    if not isinstance(payload.get("ingredients"), list) or not payload["ingredients"]:
        raise ValueError("payload.ingredients must be a non-empty array")
    return payload


def parse_timestamp(value: str | None) -> str:
    if not value:
        return utc_now_iso()
    return datetime.fromisoformat(value.replace("Z", "+00:00")).isoformat()


def to_float(value: Any) -> float:
    if value in (None, "", False):
        return 0.0
    return round(float(value), 2)


def slug_date(iso_timestamp: str) -> str:
    return datetime.fromisoformat(iso_timestamp).date().isoformat()


def nutrition_csv_path(data_root: Path) -> Path:
    return data_root / "nutrition" / "meals.csv"


def summarize_day(data_root: Path, date_str: str) -> dict[str, Any]:
    path = nutrition_csv_path(data_root)
    totals: dict[str, Any] = {
        "date": date_str,
        "entries": 0,
        "meal_count": 0,
        "calories_kcal": 0.0,
        "protein_g": 0.0,
        "carbs_g": 0.0,
        "fat_g": 0.0,
        "fiber_g": 0.0,
        "micronutrients": {},
        "top_micros": [],
    }
    micro_totals: dict[str, float] = defaultdict(float)
    meal_ids: set[str] = set()
    if not path.exists():
        return totals

    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if row.get("date") != date_str:
                continue
            totals["entries"] += 1
            meal_ids.add(row["meal_id"])
            for key in ("calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"):
                totals[key] = round(totals[key] + to_float(row.get(key)), 2)
            micros = json.loads(row.get("micronutrients_json") or "{}")
            if isinstance(micros, dict):
                for micro_key, micro_val in micros.items():
                    micro_totals[str(micro_key)] += to_float(micro_val)

    totals["meal_count"] = len(meal_ids)
    totals["micronutrients"] = {
        k: round(v, 2) for k, v in sorted(micro_totals.items()) if v > 0
    }
    totals["top_micros"] = [
        {"name": name, "value": round(value, 2)}
        for name, value in sorted(
            micro_totals.items(), key=lambda item: (-item[1], item[0])
        )[:5]
    ]
    return totals


def log_payload(payload: dict[str, Any], data_root: Path) -> dict[str, Any]:
    timestamp = parse_timestamp(payload.get("timestamp"))
    date_str = slug_date(timestamp)
    meal_id = str(payload.get("meal_id") or uuid.uuid4())
    meal_confidence = to_float(payload.get("confidence"))
    meal_type = str(payload.get("meal_type") or "unspecified")
    source = str(payload.get("source") or "manual")
    notes = str(payload.get("notes") or "")
    photo_ref = str(payload.get("photo_ref") or "")

    rows: list[dict[str, Any]] = []
    resolved_ingredients: list[dict[str, Any]] = []
    meal_totals = {
        "calories_kcal": 0.0,
        "protein_g": 0.0,
        "carbs_g": 0.0,
        "fat_g": 0.0,
        "fiber_g": 0.0,
    }

    for ingredient in payload["ingredients"]:
        resolved = enrich_ingredient(ingredient, data_root)
        ingredient_name = str(resolved["name"])
        micros = resolved.get("micronutrients", {})
        if micros is None:
            micros = {}
        if not isinstance(micros, dict):
            raise ValueError("ingredient micronutrients must be an object")
        row = {
            "timestamp": timestamp,
            "date": date_str,
            "meal_id": meal_id,
            "meal_type": meal_type,
            "source": source,
            "ingredient_name": ingredient_name,
            "normalized_name": str(resolved.get("normalized_name") or ""),
            "amount_g": to_float(resolved.get("amount_g")),
            "portion_text": str(resolved.get("portion") or ""),
            "calories_kcal": to_float(resolved.get("calories_kcal")),
            "protein_g": to_float(resolved.get("protein_g")),
            "carbs_g": to_float(resolved.get("carbs_g")),
            "fat_g": to_float(resolved.get("fat_g")),
            "fiber_g": to_float(resolved.get("fiber_g")),
            "micronutrients_json": json.dumps(micros, ensure_ascii=False, sort_keys=True),
            "nutrient_source": str(resolved.get("nutrient_source") or ""),
            "ingredient_confidence": to_float(resolved.get("confidence") or meal_confidence),
            "meal_confidence": meal_confidence,
            "notes": notes,
            "photo_ref": photo_ref,
        }
        rows.append(row)
        resolved_ingredients.append(
            {
                "name": ingredient_name,
                "normalized_name": row["normalized_name"],
                "amount_g": row["amount_g"],
                "portion": row["portion_text"],
                "calories_kcal": row["calories_kcal"],
                "protein_g": row["protein_g"],
                "carbs_g": row["carbs_g"],
                "fat_g": row["fat_g"],
                "fiber_g": row["fiber_g"],
                "micronutrients": micros,
                "nutrient_source": row["nutrient_source"],
                "confidence": row["ingredient_confidence"],
            }
        )
        for key in meal_totals:
            meal_totals[key] = round(meal_totals[key] + row[key], 2)

    append_csv_rows(nutrition_csv_path(data_root), FIELDNAMES, rows)
    day_summary = summarize_day(data_root, date_str)
    return {
        "ok": True,
        "meal_id": meal_id,
        "timestamp": timestamp,
        "date": date_str,
        "meal_type": meal_type,
        "source": source,
        "meal_totals": meal_totals,
        "ingredient_count": len(rows),
        "ingredients": resolved_ingredients,
        "day_summary": day_summary,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Estimate and log nutrition data.")
    parser.add_argument(
        "--data-root",
        type=Path,
        default=default_data_root(),
        help="Root data directory (default: repo longevityOS-data/).",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    log_parser = subparsers.add_parser("log", help="Append an ingredient-centric meal log.")
    log_parser.add_argument("--input-json", type=Path, required=True)

    summary_parser = subparsers.add_parser("summary", help="Summarize a day of nutrition.")
    summary_parser.add_argument("--date", required=True, help="ISO date, e.g. 2026-03-18.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    data_root: Path = args.data_root

    if args.command == "log":
        payload = load_payload(args.input_json)
        result = log_payload(payload, data_root)
    else:
        result = summarize_day(data_root, args.date)

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
