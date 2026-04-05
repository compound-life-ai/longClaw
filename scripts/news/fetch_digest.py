from __future__ import annotations

import argparse
import json
import ssl
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import load_json, write_json
from scripts.common.debug_log import log_event


SOURCES = [
    {
        "name": "Fight Aging!",
        "feed": "https://www.fightaging.org/feed/",
        "site": "https://www.fightaging.org/",
    },
    {
        "name": "National Institute on Aging",
        "feed": "https://www.nia.nih.gov/news/rss.xml",
        "site": "https://www.nia.nih.gov/",
    },
    {
        "name": "ScienceDaily Nutrition",
        "feed": "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml",
        "site": "https://www.sciencedaily.com/news/health_medicine/nutrition/",
    },
]

KEYWORDS = {
    "nutrition": 3,
    "sleep": 3,
    "exercise": 3,
    "aging": 3,
    "ageing": 3,
    "protein": 2,
    "fiber": 2,
    "recovery": 2,
    "trial": 2,
    "biomarker": 2,
    "metabolic": 2,
}


def cache_path(data_root: Path) -> Path:
    return data_root / "news" / "cache.json"


def text_or_empty(element: ET.Element | None) -> str:
    if element is None or element.text is None:
        return ""
    return element.text.strip()


def parse_feed(xml_bytes: bytes, source_name: str) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_bytes)
    items: list[dict[str, Any]] = []

    channel = root.find("channel")
    if channel is not None:
        for item in channel.findall("item"):
            items.append(
                {
                    "source": source_name,
                    "title": text_or_empty(item.find("title")),
                    "url": text_or_empty(item.find("link")),
                    "summary": text_or_empty(item.find("description")),
                    "published_at": text_or_empty(item.find("pubDate")),
                }
            )
        return items

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    for entry in root.findall("atom:entry", ns):
        link = entry.find("atom:link", ns)
        href = link.attrib.get("href", "") if link is not None else ""
        items.append(
            {
                "source": source_name,
                "title": text_or_empty(entry.find("atom:title", ns)),
                "url": href,
                "summary": text_or_empty(entry.find("atom:summary", ns))
                or text_or_empty(entry.find("atom:content", ns)),
                "published_at": text_or_empty(entry.find("atom:updated", ns)),
            }
        )
    return items


def score_item(item: dict[str, Any]) -> int:
    haystack = " ".join(
        str(item.get(field, "")).lower() for field in ("title", "summary", "source")
    )
    return sum(weight for keyword, weight in KEYWORDS.items() if keyword in haystack)


def dedupe_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in items:
        key = item.get("url") or item.get("title")
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def fetch_feed(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "compound-clawskill/0.1 (+https://docs.openclaw.ai)"},
    )
    context = ssl.create_default_context()
    with urllib.request.urlopen(request, context=context, timeout=20) as response:
        return response.read()


def fetch_digest(data_root: Path, limit: int) -> dict[str, Any]:
    all_items: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for source in SOURCES:
        try:
            xml_bytes = fetch_feed(source["feed"])
            parsed = parse_feed(xml_bytes, source["name"])
            all_items.extend(parsed)
            log_event("fetch_digest", "feed_fetch", data_root=data_root,
                      source=source["name"], status="ok", items=len(parsed))
        except Exception as exc:  # pragma: no cover - exercised in manual runs
            errors.append({"source": source["name"], "error": str(exc)})
            log_event("fetch_digest", "feed_fetch", data_root=data_root,
                      source=source["name"], status="error", error=str(exc))

    deduped = dedupe_items(all_items)
    scored = []
    for item in deduped:
        item = dict(item)
        item["score"] = score_item(item)
        scored.append(item)

    ranked = sorted(
        scored,
        key=lambda item: (int(item["score"]), item.get("published_at", ""), item["title"]),
        reverse=True,
    )

    log_event("fetch_digest", "ranked", data_root=data_root,
              total_items=len(deduped), returned=min(limit, len(ranked)))

    payload = {
        "fetched_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "sources": SOURCES,
        "errors": errors,
        "items": ranked[:limit],
    }
    write_json(cache_path(data_root), payload)
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch a curated health news digest.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    parser.add_argument("--limit", type=int, default=6)
    args = parser.parse_args()

    payload = fetch_digest(args.data_root, limit=args.limit)
    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
