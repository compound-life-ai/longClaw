from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from scripts.common.paths import default_data_root
from scripts.common.storage import load_json, write_json
from scripts.health.profile_store import default_profile, profile_path
from scripts.insights.experiments import default_experiments, experiments_path
from scripts.news.fetch_digest import cache_path, score_item


TOPIC_TAXONOMY: dict[str, dict[str, Any]] = {
    "sleep": {
        "keywords": ["sleep", "insomnia", "sleep quality", "sleep latency", "nighttime awakenings"],
        "query": "sleep health longevity research news",
        "official_domains": ["nia.nih.gov", "nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com", "fightaging.org"],
    },
    "circadian": {
        "keywords": ["circadian", "melatonin", "light exposure", "chronotype", "body clock"],
        "query": "circadian rhythm sleep health research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "protein": {
        "keywords": ["protein", "whey", "leucine", "amino acid", "muscle protein synthesis"],
        "query": "protein intake muscle recovery nutrition research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "fiber": {
        "keywords": ["fiber", "fibre", "gut microbiome", "prebiotic", "short-chain fatty acid"],
        "query": "fiber gut microbiome nutrition research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "metabolic-health": {
        "keywords": ["metabolic", "glucose", "insulin", "blood sugar", "glycemic", "glucose control"],
        "query": "metabolic health glucose insulin research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "exercise": {
        "keywords": ["exercise", "training", "strength training", "cardio", "vo2 max", "aerobic"],
        "query": "exercise training adaptation health research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com", "fightaging.org"],
    },
    "recovery": {
        "keywords": ["recovery", "soreness", "muscle damage", "rest day", "adaptation"],
        "query": "exercise recovery muscle soreness research news",
        "official_domains": ["nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "aging": {
        "keywords": ["aging", "ageing", "longevity", "senolytic", "senescence", "biological age"],
        "query": "aging longevity senescence research news",
        "official_domains": ["nia.nih.gov", "nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["fightaging.org", "sciencedaily.com"],
    },
    "cognition": {
        "keywords": ["cognition", "cognitive", "memory", "dementia", "brain health", "alzheimer"],
        "query": "cognition brain health dementia research news",
        "official_domains": ["nia.nih.gov", "nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
    "supplements": {
        "keywords": ["supplement", "creatine", "omega-3", "magnesium", "vitamin d", "nutraceutical"],
        "query": "supplements nutrition health research news",
        "official_domains": ["nih.gov", "ods.od.nih.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov"],
        "secondary_domains": ["sciencedaily.com"],
    },
}

SOURCE_WEIGHTS = {
    "query-override": 200,
    "followed-topic": 120,
    "active-experiment": 90,
    "recent-topic-history": 70,
    "health-profile": 40,
    "archived-experiment": 20,
}
SOURCE_PRIORITY = {
    "query-override": 0,
    "followed-topic": 1,
    "active-experiment": 2,
    "recent-topic-history": 3,
    "health-profile": 4,
    "archived-experiment": 5,
}
QUALITY_SCORES = {"primary": 35, "official": 32, "curated": 18, "secondary": 8, "unknown": 4}
CURATED_DOMAINS = {"fightaging.org", "sciencedaily.com"}
PRIMARY_DOMAINS = {"ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov", "nejm.org", "jamanetwork.com", "thelancet.com", "bmj.com"}
OFFICIAL_DOMAINS = {"nih.gov", "nia.nih.gov", "cdc.gov", "who.int", "ods.od.nih.gov"}


def topic_history_path(data_root: Path) -> Path:
    return data_root / "news" / "topic_history.json"


def default_topic_history() -> list[dict[str, Any]]:
    return []


def load_topic_history(data_root: Path) -> list[dict[str, Any]]:
    payload = load_json(topic_history_path(data_root), default_topic_history())
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict) and item.get("topic")]


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.strip()
    if not normalized:
        return None
    try:
        parsed = datetime.fromisoformat(normalized.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = parsedate_to_datetime(normalized)
        except (TypeError, ValueError, IndexError):
            return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def normalize_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", normalize_text(value)).strip()


def canonicalize_url(value: str) -> str:
    if not value:
        return ""
    parsed = urlparse(value.strip())
    if not parsed.scheme and not parsed.netloc:
        return value.strip().lower().rstrip("/")
    filtered = [
        (key, item)
        for key, item in parse_qsl(parsed.query, keep_blank_values=True)
        if not key.lower().startswith("utm_") and key.lower() not in {"fbclid", "gclid"}
    ]
    normalized = parsed._replace(
        scheme=parsed.scheme.lower(),
        netloc=parsed.netloc.lower(),
        query=urlencode(filtered),
        fragment="",
    )
    return urlunparse(normalized).rstrip("/")


def domain_from_item(item: dict[str, Any]) -> str:
    url = str(item.get("url") or "").strip()
    if not url:
        return ""
    domain = urlparse(url).netloc.lower()
    return domain[4:] if domain.startswith("www.") else domain


def topic_hits_from_text(text: Any) -> dict[str, int]:
    haystack = normalize_text(text)
    hits: dict[str, int] = {}
    for topic, spec in TOPIC_TAXONOMY.items():
        count = 0
        for keyword in spec["keywords"]:
            if normalize_text(keyword) in haystack:
                count += 1
        if count:
            hits[topic] = count
    return hits


def topics_from_values(values: list[Any]) -> list[str]:
    totals: dict[str, int] = {}
    for value in values:
        if isinstance(value, list):
            for topic in topics_from_values(value):
                totals[topic] = totals.get(topic, 0) + 1
            continue
        text = normalize_text(value)
        if not text:
            continue
        if text in TOPIC_TAXONOMY:
            totals[text] = totals.get(text, 0) + 2
        for topic, count in topic_hits_from_text(text).items():
            totals[topic] = totals.get(topic, 0) + count
    return [topic for topic, _ in sorted(totals.items(), key=lambda item: (-item[1], item[0]))]


def add_topic_signal(topic_scores: dict[str, dict[str, Any]], topic: str, weight: int, reason: str, source: str) -> None:
    if topic not in TOPIC_TAXONOMY:
        return
    entry = topic_scores.setdefault(topic, {"topic": topic, "weight": 0, "reasons": [], "sources": []})
    entry["weight"] += weight
    if reason not in entry["reasons"]:
        entry["reasons"].append(reason)
    if source not in entry["sources"]:
        entry["sources"].append(source)


def add_topics_from_text(topic_scores: dict[str, dict[str, Any]], text: Any, *, base_weight: int, reason: str, source: str) -> None:
    for topic, count in topic_hits_from_text(text).items():
        add_topic_signal(topic_scores, topic, base_weight + (count - 1) * 5, reason, source)


def build_interest_profile(data_root: Path, *, user_query: str = "", top_topic_limit: int = 3, now: datetime | str | None = None) -> dict[str, Any]:
    now_dt = parse_datetime(now) if isinstance(now, str) else now
    now_dt = now_dt or datetime.now(timezone.utc)
    profile = load_json(profile_path(data_root), default_profile())
    experiments = load_json(experiments_path(data_root), default_experiments())
    topic_history = load_topic_history(data_root)
    topic_scores: dict[str, dict[str, Any]] = {}

    query_override_topics = topics_from_values([user_query]) if user_query else []
    for topic in query_override_topics:
        add_topic_signal(topic_scores, topic, SOURCE_WEIGHTS["query-override"], "query override", "query-override")

    preferences = profile.get("preferences", {}) if isinstance(profile, dict) else {}
    followed_topics = topics_from_values([preferences.get("news_topics", [])]) if isinstance(preferences, dict) else []
    for topic in followed_topics:
        add_topic_signal(topic_scores, topic, SOURCE_WEIGHTS["followed-topic"], "followed topic", "followed-topic")

    active_experiment_id = experiments.get("active_experiment_id") if isinstance(experiments, dict) else None
    items = experiments.get("items", []) if isinstance(experiments, dict) else []
    active_experiment = next((item for item in items if isinstance(item, dict) and item.get("id") == active_experiment_id), None)
    archived_experiments = [item for item in items if isinstance(item, dict) and item is not active_experiment]

    if active_experiment:
        for topic in topics_from_values([
            active_experiment.get("domain"),
            active_experiment.get("title"),
            active_experiment.get("primary_outcome"),
            active_experiment.get("secondary_outcomes", []),
        ]):
            add_topic_signal(topic_scores, topic, SOURCE_WEIGHTS["active-experiment"], "active experiment", "active-experiment")
        add_topics_from_text(
            topic_scores,
            " ".join(str(active_experiment.get(field, "")) for field in ("title", "hypothesis", "intervention", "analysis_summary", "next_action")),
            base_weight=SOURCE_WEIGHTS["active-experiment"] - 10,
            reason="active experiment notes",
            source="active-experiment",
        )

    history_entries = sorted(
        topic_history,
        key=lambda item: (str(item.get("last_seen_at", "")), int(item.get("count", 0)), str(item.get("topic", ""))),
        reverse=True,
    )
    for entry in history_entries:
        topic = str(entry.get("topic") or "")
        if topic not in TOPIC_TAXONOMY:
            continue
        last_seen = parse_datetime(str(entry.get("last_seen_at") or ""))
        age_days = (now_dt - last_seen).days if last_seen else 999
        age_weight = SOURCE_WEIGHTS["recent-topic-history"] if age_days <= 30 else SOURCE_WEIGHTS["recent-topic-history"] - 15 if age_days <= 90 else SOURCE_WEIGHTS["recent-topic-history"] - 30
        add_topic_signal(
            topic_scores,
            topic,
            age_weight + min(int(entry.get("count", 0)), 3) * 5,
            "recent news ask",
            "recent-topic-history",
        )

    questionnaire = profile.get("questionnaire", {}) if isinstance(profile, dict) else {}
    profile_text_values = []
    if isinstance(profile, dict):
        profile_text_values.extend(profile.get("goals", []))
        profile_text_values.extend(profile.get("constraints", []))
    if isinstance(questionnaire, dict):
        profile_text_values.extend(questionnaire.values())
    add_topics_from_text(
        topic_scores,
        " ".join(str(value) for value in profile_text_values if value),
        base_weight=SOURCE_WEIGHTS["health-profile"],
        reason="health profile",
        source="health-profile",
    )

    for experiment in archived_experiments:
        add_topics_from_text(
            topic_scores,
            " ".join(str(experiment.get(field, "")) for field in ("domain", "title", "hypothesis", "intervention", "analysis_summary", "next_action")),
            base_weight=SOURCE_WEIGHTS["archived-experiment"],
            reason="archived experiment",
            source="archived-experiment",
        )

    top_topics = sorted(
        topic_scores.values(),
        key=lambda item: (min(SOURCE_PRIORITY[source] for source in item["sources"]), -int(item["weight"]), item["topic"]),
    )[:top_topic_limit]
    for entry in top_topics:
        spec = TOPIC_TAXONOMY[entry["topic"]]
        entry["label"] = entry["topic"].replace("-", " ")
        entry["search_query"] = spec["query"]
        entry["official_domains"] = spec["official_domains"]
        entry["secondary_domains"] = spec["secondary_domains"]

    return {
        "query_override_topics": query_override_topics,
        "followed_topics": followed_topics,
        "top_topics": top_topics,
        "active_experiment_id": active_experiment_id,
    }


def is_cache_stale(cache_payload: dict[str, Any], *, now: datetime, stale_hours: int) -> tuple[bool, float | None]:
    fetched_at = parse_datetime(str(cache_payload.get("fetched_at") or ""))
    if fetched_at is None:
        return True, None
    age_hours = round((now - fetched_at).total_seconds() / 3600.0, 2)
    return age_hours > stale_hours, age_hours


def source_quality(item: dict[str, Any]) -> str:
    explicit = normalize_text(item.get("source_quality"))
    if explicit in QUALITY_SCORES:
        return explicit
    domain = domain_from_item(item)
    if any(domain == candidate or domain.endswith(f".{candidate}") for candidate in PRIMARY_DOMAINS):
        return "primary"
    if any(domain == candidate or domain.endswith(f".{candidate}") for candidate in OFFICIAL_DOMAINS):
        return "official"
    if any(domain == candidate or domain.endswith(f".{candidate}") for candidate in CURATED_DOMAINS):
        return "curated"
    return "secondary" if domain else "unknown"


def recency_score(published_at: str, *, now: datetime) -> tuple[int, int | None]:
    published_dt = parse_datetime(published_at)
    if published_dt is None:
        return 0, None
    age_days = max(int((now - published_dt).total_seconds() // 86400), 0)
    if age_days <= 7:
        return 20, age_days
    if age_days <= 30:
        return 12, age_days
    if age_days <= 90:
        return 4, age_days
    return -8, age_days


def build_selection_reason(matched_topics: list[str], top_topics_by_name: dict[str, dict[str, Any]], quality: str) -> str:
    reasons = []
    for topic in matched_topics[:2]:
        interest = top_topics_by_name.get(topic, {})
        source_reason = interest.get("reasons", ["personalized topic"])[0]
        reasons.append(f"matches {topic.replace('-', ' ')} via {source_reason}")
    if quality in {"primary", "official"}:
        reasons.append(f"{quality} source")
    return "; ".join(reasons) if reasons else "high generic relevance"


def score_candidate_item(item: dict[str, Any], *, top_topics_by_name: dict[str, dict[str, Any]], now: datetime, origin: str) -> dict[str, Any]:
    enriched = dict(item)
    haystack = " ".join(str(enriched.get(field, "")) for field in ("title", "summary", "source"))
    matched_topics = [topic for topic in top_topics_by_name if topic in topic_hits_from_text(haystack)]
    base_score = max(int(enriched.get("score", 0)), score_item(enriched))
    topic_bonus = sum(min(int(top_topics_by_name[topic]["weight"]), 160) // 4 for topic in matched_topics)
    quality = source_quality(enriched)
    freshness_bonus, age_days = recency_score(str(enriched.get("published_at") or ""), now=now)
    enriched["score"] = base_score
    enriched["matched_topics"] = matched_topics
    enriched["source_quality"] = quality
    enriched["age_days"] = age_days
    enriched["origin"] = origin
    enriched["personalization_score"] = base_score * 2 + topic_bonus + QUALITY_SCORES[quality] + freshness_bonus
    enriched["selection_reason"] = build_selection_reason(matched_topics, top_topics_by_name, quality)
    return enriched


def candidate_sort_key(item: dict[str, Any]) -> tuple[int, int, int, str]:
    age_days = item.get("age_days")
    freshness_rank = -age_days if isinstance(age_days, int) else -9999
    return (int(item.get("personalization_score", 0)), int(item.get("score", 0)), freshness_rank, str(item.get("title", "")))


def load_search_results(path: Path | None) -> list[dict[str, Any]]:
    if path is None:
        return []
    payload = load_json(path, [])
    if isinstance(payload, dict):
        payload = payload.get("items", [])
    return [item for item in payload if isinstance(item, dict)] if isinstance(payload, list) else []


def dedupe_ranked_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in items:
        key = canonicalize_url(str(item.get("url") or "")) or normalize_title(str(item.get("title") or ""))
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def record_topic_history(data_root: Path, *, topics: list[str], source: str, now: datetime) -> list[dict[str, Any]]:
    if not topics:
        return load_topic_history(data_root)
    history = load_topic_history(data_root)
    updated = {str(item.get("topic")): dict(item) for item in history if str(item.get("topic")) in TOPIC_TAXONOMY}
    timestamp = now.replace(microsecond=0).isoformat()
    for topic in topics:
        entry = updated.get(topic)
        if entry is None:
            updated[topic] = {
                "topic": topic,
                "first_seen_at": timestamp,
                "last_seen_at": timestamp,
                "count": 1,
                "source": source,
            }
            continue
        entry["last_seen_at"] = timestamp
        entry["count"] = int(entry.get("count", 0)) + 1
        entry["source"] = source
    ordered = sorted(updated.values(), key=lambda item: (str(item.get("last_seen_at", "")), int(item.get("count", 0)), str(item.get("topic", ""))), reverse=True)
    write_json(topic_history_path(data_root), ordered)
    return ordered


def build_search_queries(top_topics: list[dict[str, Any]], uncovered_topics: list[str]) -> list[dict[str, Any]]:
    uncovered = set(uncovered_topics)
    return [
        {
            "topic": topic["topic"],
            "priority": index,
            "query": topic["search_query"],
            "official_domains": topic["official_domains"],
            "secondary_domains": topic["secondary_domains"],
            "preferred_recency_days": 30,
            "fallback_recency_days": 90,
            "needs_search": topic["topic"] in uncovered,
        }
        for index, topic in enumerate(top_topics, start=1)
    ]


def covered_topics_from_items(items: list[dict[str, Any]], *, freshness_days: int = 30) -> set[str]:
    covered: set[str] = set()
    for item in items:
        age_days = item.get("age_days")
        if not isinstance(age_days, int) or age_days > freshness_days:
            continue
        for topic in item.get("matched_topics", []):
            covered.add(topic)
    return covered


def build_personalized_digest(
    data_root: Path,
    *,
    user_query: str = "",
    limit: int = 6,
    top_topic_limit: int = 3,
    stale_hours: int = 24,
    now: datetime | str | None = None,
    search_results: list[dict[str, Any]] | None = None,
    record_source: str = "user-query",
) -> dict[str, Any]:
    now_dt = parse_datetime(now) if isinstance(now, str) else now
    now_dt = now_dt or datetime.now(timezone.utc)
    cache_payload = load_json(cache_path(data_root), {})
    interest_profile = build_interest_profile(data_root, user_query=user_query, top_topic_limit=top_topic_limit, now=now_dt)
    top_topics = interest_profile["top_topics"]
    cache_items = cache_payload.get("items", []) if isinstance(cache_payload, dict) else []
    stale, age_hours = is_cache_stale(cache_payload if isinstance(cache_payload, dict) else {}, now=now_dt, stale_hours=stale_hours)

    if interest_profile["query_override_topics"]:
        topic_history = record_topic_history(data_root, topics=interest_profile["query_override_topics"], source=record_source, now=now_dt)
    else:
        topic_history = load_topic_history(data_root)

    if not top_topics:
        generic_candidates = [
            score_candidate_item(item, top_topics_by_name={}, now=now_dt, origin="cache")
            for item in cache_items
            if isinstance(item, dict)
        ]
        generic_candidates = dedupe_ranked_items(sorted(generic_candidates, key=candidate_sort_key, reverse=True))
        return {
            "generated_at": now_dt.replace(microsecond=0).isoformat(),
            "mode": "generic-fallback",
            "cache": {"exists": bool(cache_items), "fetched_at": cache_payload.get("fetched_at") if isinstance(cache_payload, dict) else None, "age_hours": age_hours, "is_stale": stale},
            "interest_profile": interest_profile,
            "cached_candidates": generic_candidates[:limit],
            "search_queries": [],
            "uncovered_topics": [],
            "needs_live_search": False,
            "selected_items": generic_candidates[:limit],
            "topic_history": topic_history,
        }

    top_topics_by_name = {item["topic"]: item for item in top_topics}
    cached_candidates = [
        score_candidate_item(item, top_topics_by_name=top_topics_by_name, now=now_dt, origin="cache")
        for item in cache_items
        if isinstance(item, dict)
    ]
    cached_candidates = dedupe_ranked_items(sorted(cached_candidates, key=candidate_sort_key, reverse=True))
    live_candidates = [
        score_candidate_item(item, top_topics_by_name=top_topics_by_name, now=now_dt, origin="search")
        for item in (search_results or [])
        if isinstance(item, dict)
    ]
    live_candidates = dedupe_ranked_items(sorted(live_candidates, key=candidate_sort_key, reverse=True))

    if live_candidates:
        covered_topics = covered_topics_from_items(cached_candidates + live_candidates)
        uncovered_topics = [topic["topic"] for topic in top_topics if topic["topic"] not in covered_topics]
    elif stale:
        uncovered_topics = [topic["topic"] for topic in top_topics]
    else:
        covered_topics = covered_topics_from_items(cached_candidates)
        uncovered_topics = [topic["topic"] for topic in top_topics if topic["topic"] not in covered_topics]

    selected_items = dedupe_ranked_items(sorted(cached_candidates + live_candidates, key=candidate_sort_key, reverse=True))[:limit]
    return {
        "generated_at": now_dt.replace(microsecond=0).isoformat(),
        "mode": "personalized",
        "cache": {"exists": bool(cache_items), "fetched_at": cache_payload.get("fetched_at") if isinstance(cache_payload, dict) else None, "age_hours": age_hours, "is_stale": stale},
        "interest_profile": interest_profile,
        "cached_candidates": cached_candidates[: max(limit, 6)],
        "search_queries": build_search_queries(top_topics, uncovered_topics),
        "uncovered_topics": uncovered_topics,
        "needs_live_search": bool(uncovered_topics),
        "selected_items": selected_items,
        "topic_history": topic_history,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build personalized /news context and ranking.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    parser.add_argument("--user-query", default="")
    parser.add_argument("--limit", type=int, default=6)
    parser.add_argument("--top-topics", type=int, default=3)
    parser.add_argument("--stale-hours", type=int, default=24)
    parser.add_argument("--now", default="")
    parser.add_argument("--record-source", default="user-query")
    parser.add_argument("--search-results-json", type=Path)
    args = parser.parse_args()

    payload = build_personalized_digest(
        args.data_root,
        user_query=args.user_query,
        limit=args.limit,
        top_topic_limit=args.top_topics,
        stale_hours=args.stale_hours,
        now=parse_datetime(args.now) if args.now else None,
        search_results=load_search_results(args.search_results_json),
        record_source=args.record_source,
    )
    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
