from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts.common.storage import write_json
from scripts.health.profile_store import default_profile, profile_path
from scripts.insights.experiments import default_experiments, experiments_path
from scripts.news.personalized_digest import build_personalized_digest, topic_history_path


class PersonalizedNewsTests(unittest.TestCase):
    def write_profile(self, data_root: Path, *, goals: list[str] | None = None, preferences: dict | None = None, questionnaire: dict | None = None) -> None:
        profile = default_profile()
        if goals is not None:
            profile['goals'] = goals
        if preferences is not None:
            profile['preferences'].update(preferences)
        if questionnaire is not None:
            profile['questionnaire'] = questionnaire
        write_json(profile_path(data_root), profile)

    def write_experiments(self, data_root: Path, payload: dict | None = None) -> None:
        write_json(experiments_path(data_root), payload or default_experiments())

    def write_cache(self, data_root: Path, *, fetched_at: str, items: list[dict]) -> None:
        write_json(
            data_root / 'news' / 'cache.json',
            {'fetched_at': fetched_at, 'sources': [], 'errors': [], 'items': items},
        )

    def test_interest_priority_prefers_followed_topics_then_active_experiment_then_history(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root, goals=['improve sleep'], preferences={'news_topics': ['protein']})
            self.write_experiments(
                data_root,
                {
                    'active_experiment_id': 'exp-1',
                    'items': [
                        {
                            'id': 'exp-1',
                            'title': 'Earlier caffeine cutoff',
                            'domain': 'sleep',
                            'hypothesis': 'Earlier caffeine cutoff improves sleep quality.',
                            'intervention': 'No caffeine after noon.',
                            'primary_outcome': 'sleep_quality',
                            'secondary_outcomes': [],
                        }
                    ],
                },
            )
            write_json(
                topic_history_path(data_root),
                [
                    {
                        'topic': 'aging',
                        'first_seen_at': '2026-03-01T00:00:00+00:00',
                        'last_seen_at': '2026-03-18T00:00:00+00:00',
                        'count': 2,
                        'source': 'user-query',
                    }
                ],
            )
            self.write_cache(data_root, fetched_at='2026-03-19T10:00:00+00:00', items=[])

            payload = build_personalized_digest(data_root, now='2026-03-19T12:00:00+00:00')

            topics = [item['topic'] for item in payload['interest_profile']['top_topics']]
            self.assertEqual(topics[0], 'protein')
            self.assertEqual(topics[1], 'sleep')
            self.assertEqual(topics[2], 'aging')

    def test_generic_fallback_when_no_interest_signals_exist(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root)
            self.write_experiments(data_root)
            self.write_cache(
                data_root,
                fetched_at='2026-03-19T10:00:00+00:00',
                items=[
                    {
                        'source': 'Example',
                        'title': 'Aging biomarker update',
                        'url': 'https://example.com/aging',
                        'summary': 'Aging and longevity article.',
                        'published_at': '2026-03-19T08:00:00+00:00',
                        'score': 7,
                    }
                ],
            )

            payload = build_personalized_digest(data_root, now='2026-03-19T12:00:00+00:00')

            self.assertEqual(payload['mode'], 'generic-fallback')
            self.assertEqual(payload['interest_profile']['top_topics'], [])
            self.assertEqual(len(payload['selected_items']), 1)

    def test_personalized_reranking_prefers_relevant_item_over_generic_higher_score(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root, goals=['improve sleep quality'])
            self.write_experiments(
                data_root,
                {
                    'active_experiment_id': 'exp-1',
                    'items': [
                        {
                            'id': 'exp-1',
                            'title': 'Earlier caffeine cutoff',
                            'domain': 'sleep',
                            'hypothesis': 'Earlier caffeine cutoff improves sleep quality.',
                            'intervention': 'No caffeine after noon.',
                            'primary_outcome': 'sleep_quality',
                            'secondary_outcomes': [],
                        }
                    ],
                },
            )
            self.write_cache(
                data_root,
                fetched_at='2026-03-19T10:00:00+00:00',
                items=[
                    {
                        'source': 'Example',
                        'title': 'Aging biomarker update',
                        'url': 'https://example.com/aging',
                        'summary': 'A high scoring longevity article.',
                        'published_at': '2026-03-19T08:00:00+00:00',
                        'score': 9,
                    },
                    {
                        'source': 'Example',
                        'title': 'Sleep consistency improves recovery',
                        'url': 'https://example.com/sleep',
                        'summary': 'A sleep quality and recovery article.',
                        'published_at': '2026-03-19T09:00:00+00:00',
                        'score': 6,
                    },
                ],
            )

            payload = build_personalized_digest(data_root, now='2026-03-19T12:00:00+00:00')

            self.assertEqual(payload['selected_items'][0]['url'], 'https://example.com/sleep')
            self.assertIn('sleep', payload['selected_items'][0]['matched_topics'])

    def test_stale_cache_triggers_live_search_for_uncovered_topics(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root, preferences={'news_topics': ['sleep']})
            self.write_experiments(data_root)
            self.write_cache(
                data_root,
                fetched_at='2026-03-17T08:00:00+00:00',
                items=[
                    {
                        'source': 'Example',
                        'title': 'Sleep and recovery',
                        'url': 'https://example.com/sleep',
                        'summary': 'Sleep article.',
                        'published_at': '2026-03-17T07:00:00+00:00',
                        'score': 6,
                    }
                ],
            )

            payload = build_personalized_digest(data_root, now='2026-03-19T12:00:00+00:00')

            self.assertTrue(payload['cache']['is_stale'])
            self.assertTrue(payload['needs_live_search'])
            self.assertIn('sleep', payload['uncovered_topics'])
            self.assertTrue(payload['search_queries'][0]['needs_search'])

    def test_query_override_updates_topic_history(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root)
            self.write_experiments(data_root)
            self.write_cache(data_root, fetched_at='2026-03-19T10:00:00+00:00', items=[])

            payload = build_personalized_digest(
                data_root,
                user_query='sleep and protein news',
                now='2026-03-19T12:00:00+00:00',
            )

            self.assertEqual(set(payload['interest_profile']['query_override_topics']), {'sleep', 'protein'})
            history = payload['topic_history']
            self.assertEqual({item['topic'] for item in history}, {'sleep', 'protein'})
            self.assertTrue(all(item['source'] == 'user-query' for item in history))

    def test_merge_dedupes_cache_and_search_results_and_explains_selection(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            self.write_profile(data_root, preferences={'news_topics': ['sleep']})
            self.write_experiments(data_root)
            self.write_cache(
                data_root,
                fetched_at='2026-03-19T10:00:00+00:00',
                items=[
                    {
                        'source': 'ScienceDaily',
                        'title': 'Sleep consistency improves recovery',
                        'url': 'https://example.com/sleep',
                        'summary': 'Sleep quality article.',
                        'published_at': '2026-03-19T09:00:00+00:00',
                        'score': 6,
                    }
                ],
            )

            payload = build_personalized_digest(
                data_root,
                now='2026-03-19T12:00:00+00:00',
                search_results=[
                    {
                        'source': 'NIH',
                        'title': 'Sleep consistency improves recovery',
                        'url': 'https://example.com/sleep',
                        'summary': 'Duplicate sleep article from live search.',
                        'published_at': '2026-03-19T09:30:00+00:00',
                        'source_quality': 'official',
                    },
                    {
                        'source': 'NIH',
                        'title': 'Circadian alignment supports sleep quality',
                        'url': 'https://nih.gov/circadian-sleep',
                        'summary': 'Circadian and sleep quality article.',
                        'published_at': '2026-03-19T10:00:00+00:00',
                        'source_quality': 'official',
                    },
                ],
            )

            urls = [item['url'] for item in payload['selected_items']]
            self.assertEqual(len(urls), len(set(urls)))
            self.assertFalse(payload['needs_live_search'])
            self.assertTrue(all(item['selection_reason'] for item in payload['selected_items']))


if __name__ == '__main__':
    unittest.main()
