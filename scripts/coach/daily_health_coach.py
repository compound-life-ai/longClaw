from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import load_json, utc_now_iso
from scripts.health.profile_store import profile_path
from scripts.insights.experiments import (
    analyze_experiment,
    checkins_path,
    count_meal_days,
    default_checkins,
    default_experiments,
    experiments_path,
    gap_report,
)
from scripts.news.fetch_digest import cache_path as news_cache_path
from scripts.nutrition.estimate_and_log import summarize_day


DOMAIN_NEWS_KEYWORDS = {
    "sleep": {"sleep", "recovery", "circadian"},
    "energy": {"energy", "metabolic", "recovery", "sleep"},
    "exercise": {"exercise", "training", "recovery", "protein"},
    "diet": {"nutrition", "protein", "fiber", "metabolic"},
}

FOCUS_TO_ACTION = {
    "meal logging consistency": "Log meals consistently today so future insights have a usable baseline.",
    "baseline data collection": "Fill in the missing health baseline data before making strong changes.",
    "sleep consistency": "Protect sleep timing tonight and keep stimulants earlier in the day.",
    "recovery attention": "Recovery is low — consider lighter intensity today and prioritize sleep tonight.",
    "protein distribution": "Spread protein across meals today instead of concentrating it late.",
    "experiment consistency": "Keep the active experiment simple and consistent today so the signal stays interpretable.",
    "experiment observation quality": "Record a clean experiment check-in after the target behavior or at the end of the day.",
}


def parse_iso_date(value: str | None) -> date:
    if value:
        return date.fromisoformat(value)
    return datetime.now().date()


def load_news_cache(data_root: Path) -> dict[str, Any]:
    payload = load_json(news_cache_path(data_root), {})
    if not isinstance(payload, dict):
        return {}
    return payload


def read_latest_checkin_status(data_root: Path, experiment_id: str, today: date) -> dict[str, Any]:
    checkins = load_json(checkins_path(data_root), default_checkins())
    relevant = [item for item in checkins if item.get("experiment_id") == experiment_id]
    if not relevant:
        return {"count": 0, "latest_timestamp": None, "checkin_needed": True}

    latest = max(relevant, key=lambda item: str(item.get("timestamp") or ""))
    latest_timestamp = str(latest.get("timestamp") or "")
    latest_dt = datetime.fromisoformat(latest_timestamp.replace("Z", "+00:00"))
    stale_before = today - timedelta(days=1)
    checkin_needed = latest_dt.date() < stale_before
    return {
        "count": len(relevant),
        "latest_timestamp": latest_timestamp,
        "checkin_needed": checkin_needed,
    }


def _collect_focus_areas(
    meal_days: int,
    yesterday_nutrition: dict[str, Any],
    profile: dict[str, Any],
    active_experiment: dict[str, Any] | None,
    checkin_needed: bool,
    missing_data: list[str],
) -> list[str]:
    focus_areas: list[str] = []
    whoop = profile.get("whoop", {}) if isinstance(profile, dict) else {}
    sleep_avg = (
        whoop.get("sleep", {}).get("daily_sleep_hours_avg")
        if isinstance(whoop, dict)
        else None
    )
    recovery_score = (
        whoop.get("recovery", {}).get("recovery_score_avg")
        if isinstance(whoop, dict)
        else None
    )

    baseline_missing = any(
        "meals" in item.lower() or "questionnaire" in item.lower() or "whoop" in item.lower()
        for item in missing_data
    )

    if active_experiment:
        focus_areas.append("experiment consistency")
    if checkin_needed:
        focus_areas.append("experiment observation quality")
    if meal_days < 3:
        focus_areas.append("meal logging consistency")
    if baseline_missing:
        focus_areas.append("baseline data collection")
    if sleep_avg and float(sleep_avg) < 7:
        focus_areas.append("sleep consistency")
    if recovery_score and float(recovery_score) < 50:
        focus_areas.append("recovery attention")
    if yesterday_nutrition.get("protein_g", 0) and float(yesterday_nutrition["protein_g"]) < 90:
        focus_areas.append("protein distribution")

    deduped: list[str] = []
    for area in focus_areas:
        if area not in deduped:
            deduped.append(area)
    return deduped[:3]


def build_suggested_actions(focus_areas: list[str]) -> list[str]:
    return [FOCUS_TO_ACTION[area] for area in focus_areas if area in FOCUS_TO_ACTION][:3]


def select_relevant_news_items(
    cache_payload: dict[str, Any],
    active_experiment: dict[str, Any] | None,
    focus_areas: list[str],
    *,
    limit: int = 2,
) -> list[dict[str, Any]]:
    items = cache_payload.get("items", [])
    if not isinstance(items, list) or not items:
        return []

    target_keywords: set[str] = set()
    if active_experiment:
        target_keywords |= DOMAIN_NEWS_KEYWORDS.get(str(active_experiment.get("domain") or ""), set())
    for area in focus_areas:
        area_lower = area.lower()
        if "sleep" in area_lower:
            target_keywords |= {"sleep", "recovery"}
        if "movement" in area_lower or "exercise" in area_lower:
            target_keywords |= {"exercise", "training", "recovery"}
        if "protein" in area_lower or "meal" in area_lower or "nutrition" in area_lower:
            target_keywords |= {"nutrition", "protein", "fiber", "metabolic"}

    if not target_keywords:
        return []

    relevant: list[dict[str, Any]] = []
    for item in items:
        haystack = " ".join(
            str(item.get(field, "")).lower() for field in ("title", "summary", "source")
        )
        matched = sorted(keyword for keyword in target_keywords if keyword in haystack)
        if not matched:
            continue
        enriched = dict(item)
        enriched["relevance_keywords"] = matched
        relevant.append(enriched)

    relevant.sort(
        key=lambda item: (
            int(item.get("score", 0)),
            len(item.get("relevance_keywords", [])),
            str(item.get("published_at", "")),
            str(item.get("title", "")),
        ),
        reverse=True,
    )
    return relevant[:limit]


def build_daily_coach_context(
    data_root: Path,
    *,
    today_date: str | None = None,
    news_limit: int = 2,
) -> dict[str, Any]:
    today = parse_iso_date(today_date)
    yesterday = (today - timedelta(days=1)).isoformat()
    meal_days = count_meal_days(data_root)
    yesterday_nutrition = summarize_day(data_root, yesterday)
    profile = load_json(profile_path(data_root), {})
    experiments = load_json(experiments_path(data_root), default_experiments())
    missing_data = gap_report(data_root).get("missing_data", [])

    active_experiment_id = experiments.get("active_experiment_id")
    active_experiment: dict[str, Any] | None = None
    latest_checkin_at: str | None = None
    checkin_needed = False
    analysis_status: str | None = None
    checkin_count = 0

    if active_experiment_id:
        items = experiments.get("items", [])
        active_experiment = next(
            (item for item in items if item.get("id") == active_experiment_id),
            None,
        )
        if active_experiment:
            analysis = analyze_experiment(data_root, str(active_experiment_id))
            analysis_status = analysis["status"]
            status = read_latest_checkin_status(data_root, str(active_experiment_id), today)
            latest_checkin_at = status["latest_timestamp"]
            checkin_needed = status["checkin_needed"]
            checkin_count = status["count"]

    focus_areas = _collect_focus_areas(
        meal_days,
        yesterday_nutrition,
        profile,
        active_experiment,
        checkin_needed,
        missing_data,
    )
    suggested_actions = build_suggested_actions(focus_areas)
    relevant_news = select_relevant_news_items(
        load_news_cache(data_root),
        active_experiment,
        focus_areas,
        limit=news_limit,
    )

    questionnaire = profile.get("questionnaire", {}) if isinstance(profile, dict) else {}
    whoop = profile.get("whoop", {}) if isinstance(profile, dict) else {}

    return {
        "generated_at": utc_now_iso(),
        "today_date": today.isoformat(),
        "ready": bool(meal_days or questionnaire or whoop or active_experiment),
        "insufficient_data": bool(missing_data),
        "missing_data": missing_data,
        "checkin_needed": checkin_needed,
        "recent_context": {
            "meal_days_logged": meal_days,
            "yesterday_date": yesterday,
            "yesterday_nutrition": yesterday_nutrition,
            "health_profile_available": bool(questionnaire or whoop),
            "questionnaire_available": bool(questionnaire),
            "whoop_available": bool(whoop),
        },
        "active_experiment": {
            "id": active_experiment.get("id") if active_experiment else None,
            "title": active_experiment.get("title") if active_experiment else None,
            "domain": active_experiment.get("domain") if active_experiment else None,
            "status": active_experiment.get("status") if active_experiment else None,
            "analysis_status": analysis_status,
            "checkin_count": checkin_count,
            "latest_checkin_at": latest_checkin_at,
        },
        "relevant_news_items": relevant_news,
        "recommended_focus_areas": focus_areas,
        "suggested_actions": suggested_actions,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build context for the daily health coach cron.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    parser.add_argument("--today-date", help="Override current date for deterministic tests.")
    parser.add_argument("--news-limit", type=int, default=2)
    args = parser.parse_args()

    payload = build_daily_coach_context(
        args.data_root,
        today_date=args.today_date,
        news_limit=args.news_limit,
    )
    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
