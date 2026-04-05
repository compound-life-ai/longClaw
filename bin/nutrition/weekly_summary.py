"""Weekly nutrition summary with RDA comparison.

Aggregates daily nutrition totals across a 7-day window, computes daily
averages, and compares each nutrient against the recommended daily intake.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from bin.common.paths import default_data_root
from bin.nutrition.estimate_and_log import summarize_day
from bin.nutrition.rda_data import RDA_DAILY


def weekly_summary(
    data_root: Path,
    end_date: str,
    *,
    days: int = 7,
    rda_profile: str = "default",
) -> dict:
    """Return a weekly nutrition summary with RDA comparison."""
    end = date.fromisoformat(end_date)
    start = end - timedelta(days=days - 1)

    rda = RDA_DAILY.get(rda_profile, RDA_DAILY["default"])

    macro_keys = ("calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g")
    macro_totals = {k: 0.0 for k in macro_keys}
    micro_totals: dict[str, float] = {}
    days_with_data = 0
    daily_details = []

    for i in range(days):
        d = (start + timedelta(days=i)).isoformat()
        day = summarize_day(data_root, d)
        daily_details.append(day)
        if day["entries"] > 0:
            days_with_data += 1
            for k in macro_keys:
                macro_totals[k] += day[k]
            for mk, mv in day.get("micronutrients", {}).items():
                micro_totals[mk] = micro_totals.get(mk, 0.0) + mv

    if days_with_data == 0:
        return {
            "period": f"{start.isoformat()} to {end.isoformat()}",
            "days_with_data": 0,
            "message": "No nutrition data found for this period.",
        }

    # Compute daily averages
    macro_avg = {k: round(v / days_with_data, 1) for k, v in macro_totals.items()}
    micro_avg = {k: round(v / days_with_data, 2) for k, v in sorted(micro_totals.items())}

    # Compare against RDA
    macro_vs_rda = {}
    for k in macro_keys:
        rda_val = rda.get(k)
        if rda_val and rda_val > 0:
            pct = round(macro_avg[k] / rda_val * 100)
            macro_vs_rda[k] = {"avg": macro_avg[k], "rda": rda_val, "pct": pct}

    micro_vs_rda = {}
    for mk, mv in micro_avg.items():
        rda_val = rda.get(mk)
        if rda_val and rda_val > 0:
            pct = round(mv / rda_val * 100)
            micro_vs_rda[mk] = {"avg": mv, "rda": rda_val, "pct": pct}

    # Identify gaps (below 75% of RDA) and strengths (above 100%)
    gaps = [
        {"nutrient": k, "avg": v["avg"], "rda": v["rda"], "pct": v["pct"]}
        for k, v in {**macro_vs_rda, **micro_vs_rda}.items()
        if v["pct"] < 75
    ]
    gaps.sort(key=lambda x: x["pct"])

    strengths = [
        {"nutrient": k, "avg": v["avg"], "rda": v["rda"], "pct": v["pct"]}
        for k, v in {**macro_vs_rda, **micro_vs_rda}.items()
        if v["pct"] >= 100
    ]
    strengths.sort(key=lambda x: -x["pct"])

    return {
        "period": f"{start.isoformat()} to {end.isoformat()}",
        "days_with_data": days_with_data,
        "rda_profile": rda_profile,
        "daily_averages": {
            "macros": macro_avg,
            "micronutrients": micro_avg,
        },
        "vs_rda": {
            "macros": macro_vs_rda,
            "micronutrients": micro_vs_rda,
        },
        "gaps": gaps,
        "strengths": strengths,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Weekly nutrition summary vs RDA.")
    parser.add_argument(
        "--end-date",
        required=True,
        help="End date of the 7-day window (ISO format, e.g. 2026-03-19).",
    )
    parser.add_argument("--days", type=int, default=7, help="Number of days (default 7).")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    parser.add_argument(
        "--rda-profile",
        default="default",
        choices=list(RDA_DAILY.keys()),
        help="RDA profile to compare against (default, male_19_50, female_19_50).",
    )
    args = parser.parse_args()

    result = weekly_summary(
        args.data_root,
        args.end_date,
        days=args.days,
        rda_profile=args.rda_profile,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
