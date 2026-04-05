"""Fetch and normalize Whoop data into a profile-ready summary.

Usage:
    python3 scripts/health/import_whoop.py \
        --token-file longevityOS-data/health/whoop_tokens.json

Outputs a JSON summary to stdout, suitable for piping into profile_store.py merge-import.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.debug_log import log_event
from scripts.common.paths import default_data_root

BASE_URL = "https://api.prod.whoop.com/developer/v2"
TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"
CLIENT_ID = "00872074-8e10-4d82-80d1-fb793f493dbb"
CLIENT_SECRET = "4eba9613ae1d4fbb07e9d9fa63e3a2f45a4bc5be2dd9e0eff6adf9b5297b162b"
USER_AGENT = "compound-clawskill/1.0"


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def _request(url: str, token: str) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": USER_AGENT,
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def fetch_collection(path: str, token: str, *, limit: int = 25) -> list[dict[str, Any]]:
    """Fetch all pages of a paginated Whoop collection endpoint."""
    records: list[dict[str, Any]] = []
    url = f"{BASE_URL}{path}?limit={limit}"
    while url:
        data = _request(url, token)
        records.extend(data.get("records", []))
        next_token = data.get("next_token")
        if next_token:
            url = f"{BASE_URL}{path}?limit={limit}&nextToken={next_token}"
        else:
            url = ""
    return records


def fetch_single(path: str, token: str) -> dict[str, Any]:
    return _request(f"{BASE_URL}{path}", token)


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------


def load_tokens(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    """Exchange a refresh token for a new access + refresh token pair."""
    body = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }).encode()
    req = urllib.request.Request(
        TOKEN_URL,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": USER_AGENT,
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def ensure_valid_token(token_path: Path, data_root: Path) -> str:
    """Return a working access token, refreshing if needed."""
    tokens = load_tokens(token_path)
    access_token = tokens["access_token"]
    # Try a lightweight call to check if the token works
    try:
        _request(f"{BASE_URL}/user/profile/basic", access_token)
        log_event("import_whoop", "token_check", data_root=data_root, status="valid")
        return access_token
    except urllib.error.HTTPError as exc:
        if exc.code != 401:
            raise
    log_event("import_whoop", "token_check", data_root=data_root, status="expired")
    # Token expired — refresh
    try:
        new_tokens = refresh_access_token(tokens["refresh_token"])
    except Exception as refresh_err:
        log_event("import_whoop", "token_refresh", data_root=data_root,
                  status="failed", error=str(refresh_err))
        raise
    updated = {
        "access_token": new_tokens["access_token"],
        "refresh_token": new_tokens.get("refresh_token", tokens["refresh_token"]),
        "exported_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    }
    token_path.write_text(json.dumps(updated, indent=2, ensure_ascii=False), encoding="utf-8")
    log_event("import_whoop", "token_refresh", data_root=data_root,
              status="ok", tokens_saved=True)
    return updated["access_token"]


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------


def average(values: list[float]) -> float:
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def ms_to_hours(ms: float) -> float:
    return round(ms / 3_600_000, 2)


def normalize_recovery(records: list[dict[str, Any]]) -> dict[str, Any]:
    scored = [r for r in records if r.get("score_state") == "SCORED" and r.get("score")]
    if not scored:
        return {}
    scores = [r["score"] for r in scored]
    return {
        "days": len(scored),
        "recovery_score_avg": average([s["recovery_score"] for s in scores]),
        "resting_heart_rate_avg": average([s["resting_heart_rate"] for s in scores]),
        "hrv_rmssd_avg": average([s["hrv_rmssd_milli"] for s in scores]),
        "spo2_avg": average([s["spo2_percentage"] for s in scores]),
        "skin_temp_celsius_avg": average([s["skin_temp_celsius"] for s in scores]),
    }


def normalize_sleep(records: list[dict[str, Any]]) -> dict[str, Any]:
    scored = [
        r for r in records
        if r.get("score_state") == "SCORED" and r.get("score") and not r.get("nap")
    ]
    if not scored:
        return {}
    stages = [s["score"]["stage_summary"] for s in scored]
    scores = [s["score"] for s in scored]
    total_sleep_ms = [
        st["total_in_bed_time_milli"] - st["total_awake_time_milli"]
        for st in stages
    ]
    return {
        "days": len(scored),
        "daily_sleep_hours_avg": average([ms_to_hours(ms) for ms in total_sleep_ms]),
        "light_sleep_hours_avg": average([ms_to_hours(st["total_light_sleep_time_milli"]) for st in stages]),
        "sws_hours_avg": average([ms_to_hours(st["total_slow_wave_sleep_time_milli"]) for st in stages]),
        "rem_hours_avg": average([ms_to_hours(st["total_rem_sleep_time_milli"]) for st in stages]),
        "sleep_efficiency_avg": average([s["sleep_efficiency_percentage"] for s in scores]),
        "sleep_performance_avg": average([s["sleep_performance_percentage"] for s in scores]),
        "sleep_consistency_avg": average([s["sleep_consistency_percentage"] for s in scores]),
        "respiratory_rate_avg": average([s["respiratory_rate"] for s in scores]),
        "disturbance_count_avg": average([float(st["disturbance_count"]) for st in stages]),
    }


def normalize_cycles(records: list[dict[str, Any]]) -> dict[str, Any]:
    scored = [r for r in records if r.get("score_state") == "SCORED" and r.get("score")]
    if not scored:
        return {}
    scores = [r["score"] for r in scored]
    return {
        "days": len(scored),
        "day_strain_avg": average([s["strain"] for s in scores]),
        "kilojoules_avg": average([s["kilojoule"] for s in scores]),
        "average_heart_rate_avg": average([float(s["average_heart_rate"]) for s in scores]),
        "max_heart_rate_avg": average([float(s["max_heart_rate"]) for s in scores]),
    }


def normalize_workouts(records: list[dict[str, Any]]) -> dict[str, Any]:
    scored = [r for r in records if r.get("score_state") == "SCORED" and r.get("score")]
    if not scored:
        return {"workout_count": 0, "by_sport": {}}
    sport_counts: dict[str, int] = {}
    for r in scored:
        sport = r.get("sport_name") or "unknown"
        sport_counts[sport] = sport_counts.get(sport, 0) + 1
    scores = [r["score"] for r in scored]
    durations_ms = [
        datetime.fromisoformat(r["end"]).timestamp() - datetime.fromisoformat(r["start"]).timestamp()
        for r in scored
        if r.get("end") and r.get("start")
    ]
    return {
        "workout_count": len(scored),
        "average_workout_minutes": average([d / 60.0 for d in durations_ms]) if durations_ms else 0.0,
        "average_strain": average([s["strain"] for s in scores]),
        "average_heart_rate_avg": average([float(s["average_heart_rate"]) for s in scores]),
        "by_sport": dict(sorted(sport_counts.items())),
    }


def normalize_body(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "height_m": data.get("height_meter"),
        "weight_kg": data.get("weight_kilogram"),
        "max_heart_rate": data.get("max_heart_rate"),
    }


def build_summary(
    recovery_records: list[dict[str, Any]],
    sleep_records: list[dict[str, Any]],
    cycle_records: list[dict[str, Any]],
    workout_records: list[dict[str, Any]],
    body_data: dict[str, Any],
) -> dict[str, Any]:
    return {
        "imported_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "source": "whoop_api_v2",
        "recovery": normalize_recovery(recovery_records),
        "sleep": normalize_sleep(sleep_records),
        "strain": normalize_cycles(cycle_records),
        "workouts": normalize_workouts(workout_records),
        "body": normalize_body(body_data),
    }


# ---------------------------------------------------------------------------
# Fetch-from-fixtures (for testing without network)
# ---------------------------------------------------------------------------


def build_summary_from_fixtures(fixture_dir: Path) -> dict[str, Any]:
    """Build a summary from saved JSON fixture files instead of live API."""
    def load(name: str) -> Any:
        return json.loads((fixture_dir / f"{name}.json").read_text(encoding="utf-8"))

    recovery = load("recovery").get("records", [])
    sleep = load("sleep").get("records", [])
    cycles = load("cycles").get("records", [])
    workouts = load("workouts").get("records", [])
    body = load("body")
    return build_summary(recovery, sleep, cycles, workouts, body)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main() -> int:
    import urllib.parse  # deferred to keep top-level import list small

    parser = argparse.ArgumentParser(description="Fetch and summarize Whoop data.")
    parser.add_argument("--token-file", type=Path, help="Path to whoop_tokens.json")
    parser.add_argument(
        "--fixture-dir", type=Path,
        help="Use saved fixture files instead of live API (for testing)",
    )
    args = parser.parse_args()

    data_root = default_data_root()

    if args.fixture_dir:
        summary = build_summary_from_fixtures(args.fixture_dir)
    elif args.token_file:
        access_token = ensure_valid_token(args.token_file, data_root)
        endpoints = [
            ("/recovery", "recovery"),
            ("/activity/sleep", "sleep"),
            ("/cycle", "cycles"),
            ("/activity/workout", "workouts"),
        ]
        fetched: dict[str, list] = {}
        for path, label in endpoints:
            records = fetch_collection(path, access_token)
            fetched[label] = records
            log_event("import_whoop", "api_fetch", data_root=data_root,
                      endpoint=path, records=len(records))
        body = fetch_single("/user/measurement/body", access_token)
        log_event("import_whoop", "api_fetch", data_root=data_root,
                  endpoint="/user/measurement/body", records=1)
        summary = build_summary(
            fetched["recovery"], fetched["sleep"],
            fetched["cycles"], fetched["workouts"], body,
        )
    else:
        parser.error("one of --token-file or --fixture-dir is required")

    print(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
