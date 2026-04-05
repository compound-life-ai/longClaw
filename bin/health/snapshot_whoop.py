"""Snapshot real Whoop API responses as test fixtures.

Run once with a valid access token to capture real response shapes:

    python3 bin/health/snapshot_whoop.py \
        --token-file longevityOS-data/health/whoop_tokens.json \
        --output-dir tests/fixtures/whoop
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from pathlib import Path

BASE_URL = "https://api.prod.whoop.com/developer"

ENDPOINTS = {
    "recovery": "/v2/recovery",
    "sleep": "/v2/activity/sleep",
    "cycles": "/v2/cycle",
    "workouts": "/v2/activity/workout",
    "body": "/v2/user/measurement/body",
    "profile": "/v2/user/profile/basic",
}


def fetch(url: str, token: str) -> dict:
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "compound-clawskill/1.0",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def main() -> int:
    parser = argparse.ArgumentParser(description="Snapshot Whoop API responses.")
    parser.add_argument("--token-file", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=10, help="Records per endpoint")
    args = parser.parse_args()

    tokens = json.loads(args.token_file.read_text(encoding="utf-8"))
    access_token = tokens["access_token"]
    args.output_dir.mkdir(parents=True, exist_ok=True)

    for name, path in ENDPOINTS.items():
        url = f"{BASE_URL}{path}"
        if name not in ("body", "profile"):
            url += f"?limit={args.limit}"
        print(f"  fetching {name} ... ", end="", flush=True)
        try:
            data = fetch(url, access_token)
            out = args.output_dir / f"{name}.json"
            out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"ok ({out})")
        except Exception as exc:
            print(f"FAILED: {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
