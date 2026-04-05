"""Structured JSONL logging for LongClaw observability.

Appends events to longevityOS-data/debug/trace.jsonl.
Reads LONGCLAW_RUN_ID, LONGCLAW_SESSION_ID, and LONGCLAW_TOOL_CALL_ID
from environment for correlation with TypeScript-level hook logs.

Usage:
    from bin.common.debug_log import log_event

    log_event("estimate_and_log", "input_loaded",
              data_root=data_root,
              ingredient_count=3, payload_keys=["meal_name", "ingredients"])
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _trace_path(data_root: Path) -> Path:
    return data_root / "debug" / "trace.jsonl"


def log_event(
    script: str,
    event: str,
    *,
    data_root: Path,
    **kwargs: Any,
) -> None:
    """Append one structured event to the trace log.

    Never raises — logging must not break the main flow.
    """
    entry: dict[str, Any] = {
        "ts": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "layer": "script_io",
        "runId": os.environ.get("LONGCLAW_RUN_ID", ""),
        "sessionId": os.environ.get("LONGCLAW_SESSION_ID", ""),
        "toolCallId": os.environ.get("LONGCLAW_TOOL_CALL_ID", ""),
        "script": script,
        "event": event,
    }
    entry.update(kwargs)
    try:
        path = _trace_path(data_root)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False, default=str) + "\n")
    except Exception:
        pass
