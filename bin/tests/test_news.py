from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from bin.common.storage import load_json
from bin.news.fetch_digest import (
    cache_path,
    dedupe_items,
    fetch_digest,
    parse_feed,
    score_item,
    text_or_empty,
)


RSS_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Sleep and exercise improve metabolic aging</title>
      <link>https://example.com/a</link>
      <description>A new nutrition and sleep finding.</description>
      <pubDate>Tue, 18 Mar 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Sleep and exercise improve metabolic aging</title>
      <link>https://example.com/a</link>
      <description>Duplicate entry.</description>
      <pubDate>Tue, 18 Mar 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
"""

ATOM_XML = b"""<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Protein intake and sleep recovery</title>
    <link href="https://example.com/atom-entry" />
    <summary>Exercise recovery and sleep adaptation.</summary>
    <updated>2026-03-18T10:00:00Z</updated>
  </entry>
</feed>
"""


class NewsScriptTests(unittest.TestCase):
    def test_parse_feed_and_score(self) -> None:
        items = parse_feed(RSS_XML, "Example Source")
        self.assertEqual(len(items), 2)
        deduped = dedupe_items(items)
        self.assertEqual(len(deduped), 1)
        self.assertGreater(score_item(deduped[0]), 0)

    def test_parse_atom_feed(self) -> None:
        items = parse_feed(ATOM_XML, "Atom Source")
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["url"], "https://example.com/atom-entry")
        self.assertIn("sleep", items[0]["summary"].lower())

    def test_dedupe_uses_title_when_url_missing(self) -> None:
        deduped = dedupe_items(
            [
                {"title": "Aging trial", "url": "", "summary": "", "source": "x"},
                {"title": "Aging trial", "url": "", "summary": "", "source": "x"},
            ]
        )
        self.assertEqual(len(deduped), 1)

    def test_fetch_digest_writes_cache_and_records_errors(self) -> None:
        payloads = {
            "https://www.fightaging.org/feed/": RSS_XML,
            "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml": ATOM_XML,
        }

        def fake_fetch(url: str) -> bytes:
            if "nia" in url:
                raise RuntimeError("boom")
            return payloads[url]

        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            with patch("bin.news.fetch_digest.fetch_feed", side_effect=fake_fetch):
                result = fetch_digest(data_root, limit=5)

            self.assertEqual(len(result["errors"]), 1)
            self.assertGreaterEqual(len(result["items"]), 2)
            self.assertTrue(cache_path(data_root).exists())
            cached = load_json(cache_path(data_root), {})
            self.assertEqual(cached["items"][0]["score"], result["items"][0]["score"])


if __name__ == "__main__":
    unittest.main()
