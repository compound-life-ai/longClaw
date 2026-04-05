from __future__ import annotations

import csv
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from bin.common.storage import write_json
from bin.coach.daily_health_coach import build_daily_coach_context
from bin.insights.experiments import add_checkin, create_experiment


REPO_ROOT = Path(__file__).resolve().parents[2]


class DailyCoachTests(unittest.TestCase):
    def test_build_context_without_data(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            payload = build_daily_coach_context(data_root, today_date="2026-03-19")
            self.assertFalse(payload["ready"])
            self.assertTrue(payload["insufficient_data"])
            self.assertGreaterEqual(len(payload["missing_data"]), 2)
            self.assertFalse(payload["checkin_needed"])
            self.assertEqual(payload["relevant_news_items"], [])

    def test_build_context_with_nutrition_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            meal_path = data_root / "nutrition" / "meals.csv"
            meal_path.parent.mkdir(parents=True, exist_ok=True)
            with meal_path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.writer(handle)
                writer.writerow(
                    [
                        "timestamp",
                        "date",
                        "meal_id",
                        "meal_type",
                        "source",
                        "ingredient_name",
                        "normalized_name",
                        "amount_g",
                        "portion_text",
                        "calories_kcal",
                        "protein_g",
                        "carbs_g",
                        "fat_g",
                        "fiber_g",
                        "micronutrients_json",
                        "nutrient_source",
                        "ingredient_confidence",
                        "meal_confidence",
                        "notes",
                        "photo_ref",
                    ]
                )
                writer.writerow(
                    [
                        "2026-03-18T12:00:00+00:00",
                        "2026-03-18",
                        "m1",
                        "lunch",
                        "manual",
                        "salmon",
                        "salmon atlantic raw",
                        "150",
                        "150 g",
                        "313.01",
                        "30.36",
                        "0",
                        "20.13",
                        "0",
                        "{\"vitamin_d_mcg\": 16.35}",
                        "catalog",
                        "0.8",
                        "0.8",
                        "",
                        "",
                    ]
                )
            payload = build_daily_coach_context(data_root, today_date="2026-03-19")
            self.assertTrue(payload["ready"])
            self.assertEqual(payload["recent_context"]["meal_days_logged"], 1)
            self.assertIn("meal logging consistency", payload["recommended_focus_areas"])

    def test_active_experiment_stale_checkin_and_relevant_news_selection(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            meal_path = data_root / "nutrition" / "meals.csv"
            meal_path.parent.mkdir(parents=True, exist_ok=True)
            meal_path.write_text(
                "\n".join(
                    [
                        "timestamp,date,meal_id,meal_type,source,ingredient_name,normalized_name,amount_g,portion_text,calories_kcal,protein_g,carbs_g,fat_g,fiber_g,micronutrients_json,nutrient_source,ingredient_confidence,meal_confidence,notes,photo_ref",
                        '2026-03-16T08:00:00+00:00,2026-03-16,m1,breakfast,manual,oats,oats,40,1 bowl,155.6,6.76,26.51,2.76,4.24,"{}",catalog,0.8,0.8,,',
                        '2026-03-17T08:00:00+00:00,2026-03-17,m2,breakfast,manual,eggs,egg whole raw,100,2 eggs,143,12.6,0.72,9.51,0,"{}",catalog,0.8,0.8,,',
                        '2026-03-18T08:00:00+00:00,2026-03-18,m3,breakfast,manual,yogurt,yogurt,170,1 cup,100,17,6,0,0,"{}",provided,0.8,0.8,,',
                    ]
                ),
                encoding="utf-8",
            )
            write_json(
                data_root / "health" / "profile.json",
                {
                    "questionnaire": {"goal": "sleep"},
                    "whoop": {
                        "sleep": {"daily_sleep_hours_avg": 6.2},
                        "recovery": {"recovery_score_avg": 42.0},
                    },
                },
            )
            experiment = create_experiment(
                data_root,
                {
                    "title": "Earlier caffeine cutoff",
                    "domain": "sleep",
                    "hypothesis": "Stopping caffeine earlier improves sleep.",
                    "null_hypothesis": "Stopping caffeine earlier does not improve sleep.",
                    "intervention": "No caffeine after 12:00.",
                    "primary_outcome": "sleep_quality",
                },
            )
            add_checkin(
                data_root,
                {
                    "experiment_id": experiment["id"],
                    "timestamp": "2026-03-17T19:00:00+00:00",
                    "compliance": 1,
                    "primary_outcome_scores": {"sleep_quality": 7},
                },
            )
            write_json(
                data_root / "news" / "cache.json",
                {
                    "fetched_at": "2026-03-19T13:00:00+00:00",
                    "sources": [],
                    "errors": [],
                    "items": [
                        {
                            "source": "Example",
                            "title": "Sleep consistency improves recovery",
                            "url": "https://example.com/sleep",
                            "summary": "A sleep and recovery article.",
                            "published_at": "2026-03-19T10:00:00Z",
                            "score": 7,
                        },
                        {
                            "source": "Example",
                            "title": "Fiber and metabolic health",
                            "url": "https://example.com/fiber",
                            "summary": "Nutrition article.",
                            "published_at": "2026-03-19T09:00:00Z",
                            "score": 5,
                        },
                    ],
                },
            )

            payload = build_daily_coach_context(data_root, today_date="2026-03-19")

            self.assertTrue(payload["ready"])
            self.assertTrue(payload["checkin_needed"])
            self.assertEqual(payload["active_experiment"]["domain"], "sleep")
            self.assertEqual(payload["active_experiment"]["analysis_status"], "needs-more-data")
            self.assertGreaterEqual(len(payload["relevant_news_items"]), 1)
            self.assertIn("sleep", payload["relevant_news_items"][0]["relevance_keywords"])
            self.assertIn("experiment observation quality", payload["recommended_focus_areas"])
            self.assertGreaterEqual(len(payload["suggested_actions"]), 1)

    def test_recent_checkin_does_not_trigger_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            write_json(
                data_root / "health" / "profile.json",
                {"questionnaire": {"goal": "energy"}, "whoop": {"recovery": {"recovery_score_avg": 72.0}}},
            )
            experiment = create_experiment(
                data_root,
                {
                    "title": "Morning walk",
                    "domain": "exercise",
                    "hypothesis": "Morning walks improve energy.",
                    "null_hypothesis": "Morning walks do not improve energy.",
                    "intervention": "20-minute walk after waking.",
                    "primary_outcome": "energy",
                },
            )
            for ts in ("2026-03-17T18:00:00+00:00", "2026-03-18T18:00:00+00:00", "2026-03-18T20:00:00+00:00"):
                add_checkin(
                    data_root,
                    {
                        "experiment_id": experiment["id"],
                        "timestamp": ts,
                        "compliance": 1,
                        "primary_outcome_scores": {"energy": 7},
                    },
                )
            payload = build_daily_coach_context(data_root, today_date="2026-03-19")
            self.assertFalse(payload["checkin_needed"])
            self.assertEqual(payload["active_experiment"]["analysis_status"], "ready-for-review")

    def test_cli_and_cron_template(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            result = subprocess.run(
                [
                    sys.executable,
                    "bin/coach/daily_health_coach.py",
                    "--data-root",
                    str(data_root),
                    "--today-date",
                    "2026-03-19",
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertIn("generated_at", payload)

        news_cron = json.loads((REPO_ROOT / "bin" / "cron" / "news-digest.example.json").read_text(encoding="utf-8"))
        coach_cron = json.loads((REPO_ROOT / "bin" / "cron" / "daily-health-coach.example.json").read_text(encoding="utf-8"))
        self.assertEqual(coach_cron["payload"]["delivery"] if "delivery" in coach_cron["payload"] else None, None)
        self.assertEqual(coach_cron["delivery"]["channel"], "telegram")
        self.assertEqual(coach_cron["sessionTarget"], "isolated")
        self.assertEqual(news_cron["schedule"]["expr"], "5 7 * * *")
        self.assertEqual(coach_cron["schedule"]["expr"], "10 7 * * *")
