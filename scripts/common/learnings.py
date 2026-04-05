"""Learnings store for LongClaw observability.

Append-only JSONL store of debugging discoveries, patterns, and pitfalls.
Agents search at session start and log after resolving issues.
Duplicates resolved at read time (latest wins per key+type).
Confidence decays: observed/inferred lose 1 point per 30 days.

CLI usage:
    python3 scripts/common/learnings.py --data-root DATA search [--type TYPE] [--query Q] [--limit N]
    python3 scripts/common/learnings.py --data-root DATA log --input-json PATH
    python3 scripts/common/learnings.py --data-root DATA read-trace --run-id RUN_ID
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import utc_now_iso

VALID_TYPES = ("pattern", "pitfall", "preference", "architecture", "tool", "operational")
VALID_SOURCES = ("observed", "user-stated", "inferred")


def learnings_path(data_root: Path) -> Path:
    return data_root / "debug" / "learnings.jsonl"


def trace_path(data_root: Path) -> Path:
    return data_root / "debug" / "trace.jsonl"


def load_learnings(data_root: Path) -> list[dict[str, Any]]:
    path = learnings_path(data_root)
    if not path.exists():
        return []
    entries: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def dedupe_learnings(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep latest entry per (key, type) pair."""
    seen: dict[str, dict[str, Any]] = {}
    for entry in entries:
        composite = f"{entry.get('key', '')}:{entry.get('type', '')}"
        seen[composite] = entry
    return list(seen.values())


def apply_confidence_decay(entry: dict[str, Any]) -> dict[str, Any]:
    """Observed/inferred learnings lose 1 confidence point per 30 days."""
    source = entry.get("source", "")
    if source not in ("observed", "inferred"):
        return entry
    ts = entry.get("ts", "")
    if not ts:
        return entry
    try:
        logged_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        days_old = (datetime.now(timezone.utc) - logged_at).days
        decay = days_old // 30
        if decay > 0:
            entry = dict(entry)
            original = entry.get("confidence", 5)
            entry["confidence"] = max(1, original - decay)
            entry["confidence_original"] = original
            entry["confidence_decayed_by"] = decay
    except (ValueError, TypeError):
        pass
    return entry


def search_learnings(
    data_root: Path,
    *,
    type_filter: str | None = None,
    query: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    raw = load_learnings(data_root)
    deduped = dedupe_learnings(raw)
    results = [apply_confidence_decay(e) for e in deduped]

    if type_filter:
        results = [e for e in results if e.get("type") == type_filter]

    if query:
        q = query.lower()
        results = [
            e for e in results
            if q in str(e.get("key", "")).lower()
            or q in str(e.get("insight", "")).lower()
            or any(q in str(f).lower() for f in e.get("files", []))
        ]

    results.sort(key=lambda e: (-e.get("confidence", 0), e.get("ts", "")), reverse=False)
    results.sort(key=lambda e: -e.get("confidence", 0))

    return {
        "total": len(deduped),
        "matched": len(results),
        "results": results[:limit],
    }


def log_learning(data_root: Path, payload: dict[str, Any]) -> dict[str, Any]:
    required = ["type", "key", "insight"]
    missing = [k for k in required if not payload.get(k)]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")

    entry_type = payload["type"]
    if entry_type not in VALID_TYPES:
        raise ValueError(f"invalid type '{entry_type}', must be one of: {', '.join(VALID_TYPES)}")

    entry = {
        "ts": payload.get("ts") or utc_now_iso(),
        "skill": payload.get("skill", ""),
        "type": entry_type,
        "key": payload["key"],
        "insight": payload["insight"],
        "confidence": min(10, max(1, int(payload.get("confidence", 5)))),
        "source": payload.get("source", "observed"),
        "files": payload.get("files", []),
    }

    path = learnings_path(data_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return {"ok": True, "entry": entry}


def read_trace(data_root: Path, run_id: str) -> dict[str, Any]:
    """Read trace.jsonl entries for a specific runId."""
    path = trace_path(data_root)
    if not path.exists():
        return {"run_id": run_id, "entries": [], "note": "trace.jsonl not found"}
    entries: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            if entry.get("runId") == run_id:
                entries.append(entry)
        except json.JSONDecodeError:
            continue
    return {"run_id": run_id, "entries": entries}


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage LongClaw learnings.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    subparsers = parser.add_subparsers(dest="command", required=True)

    search_p = subparsers.add_parser("search", help="Search existing learnings.")
    search_p.add_argument("--type", dest="type_filter", choices=VALID_TYPES)
    search_p.add_argument("--query", help="Keyword search across key, insight, files.")
    search_p.add_argument("--limit", type=int, default=10)

    log_p = subparsers.add_parser("log", help="Log a new learning.")
    log_p.add_argument("--input-json", type=Path, required=True)

    trace_p = subparsers.add_parser("read-trace", help="Read trace entries by runId.")
    trace_p.add_argument("--run-id", required=True)

    args = parser.parse_args()

    if args.command == "search":
        result = search_learnings(
            args.data_root,
            type_filter=args.type_filter,
            query=args.query,
            limit=args.limit,
        )
    elif args.command == "log":
        with args.input_json.open("r", encoding="utf-8") as f:
            payload = json.load(f)
        result = log_learning(args.data_root, payload)
    else:
        result = read_trace(args.data_root, args.run_id)

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
