---
name: news
description: Fetch and summarize a personalized health and longevity news digest using profile context, experiment context, curated feeds, and live search when needed.
user-invocable: true
---

# News

Use this skill when:

- the user asks about health/longevity news or research (e.g. "any interesting longevity news?", "what's new in sleep research?")
- a scheduled digest needs to be generated
- the user invokes `/news` (legacy shortcut)

Rules:

- Reply in the user's language.
- `/news` is personalized by default. Prefer the user's explicit topic if they gave one, otherwise infer interests from the health profile, experiments, and topic history.
- Refresh the curated RSS cache first, then use the personalized digest script to decide whether live search is necessary.
- Use live search only for uncovered topics or stale cache, and keep source attribution explicit.
- Keep health claims cautious and tied to the linked source context.

Run the curated fetch first:

```bash
python3 "{baseDir}/../../scripts/news/fetch_digest.py"   --data-root "{baseDir}/../../longevityOS-data"   --limit 12
```

Then build personalized context using the latest user request as `--user-query`:

```bash
python3 "{baseDir}/../../scripts/news/personalized_digest.py"   --data-root "{baseDir}/../../longevityOS-data"   --user-query "<latest user request>"   --limit 6   --top-topics 3
```

If `needs_live_search` is `false`:

- summarize `selected_items`
- mention source names and URLs
- use each item's `selection_reason` to explain why it was chosen

If `needs_live_search` is `true`:

1. For each `search_queries` item with `needs_search = true`, search official/primary domains first using the provided `official_domains` list and a recency target of 30 days.
2. If those results are weak or too sparse, run one fallback search for that topic using the provided `secondary_domains` list or a broader search up to 90 days.
3. Save the live search results to a temp JSON file with this shape:

```json
{
  "items": [
    {
      "source": "NIH",
      "title": "Article title",
      "url": "https://example.com/article",
      "summary": "1-2 sentence summary",
      "published_at": "2026-03-19T10:00:00Z",
      "source_quality": "official"
    }
  ]
}
```

4. Re-run the personalized digest merger:

```bash
python3 "{baseDir}/../../scripts/news/personalized_digest.py"   --data-root "{baseDir}/../../longevityOS-data"   --user-query "<latest user request>"   --limit 6   --top-topics 3   --search-results-json /tmp/news_search_results.json
```

Then:

- summarize the final `selected_items`
- mention source names and URLs
- explain relevance using `selection_reason`
- keep the digest compact for scheduled runs
