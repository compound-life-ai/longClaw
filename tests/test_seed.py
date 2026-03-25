from __future__ import annotations

import csv
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts.common.storage import load_json
from scripts.health.profile_store import default_profile, profile_path
from scripts.insights.experiments import (
    analyze_experiment,
    checkins_path,
    experiments_path,
    gap_report,
)
from scripts.nutrition.estimate_and_log import FIELDNAMES, summarize_day


REPO_ROOT = Path(__file__).resolve().parents[1]
SEED_DIR = REPO_ROOT / "seed"


class SeedFixtureValidityTests(unittest.TestCase):
    def test_seed_directory_exists(self) -> None:
        self.assertTrue(SEED_DIR.is_dir())

    def test_meals_csv_columns_match_fieldnames(self) -> None:
        with (SEED_DIR / "nutrition" / "meals.csv").open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            self.assertEqual(reader.fieldnames, FIELDNAMES)

    def test_meals_csv_rows_are_parseable(self) -> None:
        with (SEED_DIR / "nutrition" / "meals.csv").open("r", encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        self.assertGreater(len(rows), 0)
        for row in rows:
            self.assertTrue(row["timestamp"])
            self.assertTrue(row["date"])
            self.assertTrue(row["meal_id"])
            self.assertTrue(row["ingredient_name"])
            json.loads(row["micronutrients_json"])
            float(row["amount_g"])
            float(row["calories_kcal"])
            float(row["protein_g"])
            float(row["carbs_g"])
            float(row["fat_g"])
            float(row["fiber_g"])

    def test_profile_json_has_expected_keys(self) -> None:
        profile = json.loads((SEED_DIR / "health" / "profile.json").read_text(encoding="utf-8"))
        for key in default_profile():
            self.assertIn(key, profile)

    def test_experiments_json_has_expected_shape(self) -> None:
        data = json.loads((SEED_DIR / "insights" / "experiments.json").read_text(encoding="utf-8"))
        self.assertIn("active_experiment_id", data)
        self.assertIn("items", data)
        self.assertIsInstance(data["items"], list)
        self.assertGreater(len(data["items"]), 0)
        required_keys = [
            "id", "title", "domain", "hypothesis", "null_hypothesis",
            "intervention", "primary_outcome", "status", "created_at",
        ]
        for item in data["items"]:
            for key in required_keys:
                self.assertIn(key, item)

    def test_checkins_json_has_expected_shape(self) -> None:
        data = json.loads((SEED_DIR / "insights" / "checkins.json").read_text(encoding="utf-8"))
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        for checkin in data:
            self.assertIn("id", checkin)
            self.assertIn("experiment_id", checkin)
            self.assertIn("compliance", checkin)
            self.assertIn("primary_outcome_scores", checkin)
            self.assertIsInstance(checkin["primary_outcome_scores"], dict)

    def test_news_cache_json_has_expected_shape(self) -> None:
        data = json.loads((SEED_DIR / "news" / "cache.json").read_text(encoding="utf-8"))
        self.assertIn("fetched_at", data)
        self.assertIn("sources", data)
        self.assertIn("items", data)
        self.assertGreater(len(data["items"]), 0)
        for item in data["items"]:
            self.assertIn("source", item)
            self.assertIn("title", item)
            self.assertIn("url", item)
            self.assertIn("score", item)

    def test_news_topic_history_json_has_expected_shape(self) -> None:
        data = json.loads((SEED_DIR / "news" / "topic_history.json").read_text(encoding="utf-8"))
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        for item in data:
            self.assertIn("topic", item)
            self.assertIn("first_seen_at", item)
            self.assertIn("last_seen_at", item)
            self.assertIn("count", item)
            self.assertIn("source", item)


class SeedIngestionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = tempfile.mkdtemp()
        self.data_root = Path(self.tmp_dir)
        for sub in ("nutrition", "health", "insights", "news"):
            (self.data_root / sub).mkdir(parents=True, exist_ok=True)
            src = SEED_DIR / sub
            for item in src.iterdir():
                shutil.copy2(item, self.data_root / sub / item.name)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp_dir)

    def test_summarize_day_reads_seeded_meals(self) -> None:
        summary = summarize_day(self.data_root, "2026-03-17")
        self.assertGreater(summary["meal_count"], 0)
        self.assertGreater(summary["calories_kcal"], 0)
        self.assertGreater(summary["protein_g"], 0)

    def test_summarize_day_covers_all_seeded_dates(self) -> None:
        with (self.data_root / "nutrition" / "meals.csv").open("r", encoding="utf-8", newline="") as f:
            dates = {row["date"] for row in csv.DictReader(f)}
        for date in dates:
            summary = summarize_day(self.data_root, date)
            self.assertGreater(summary["entries"], 0, f"no entries for {date}")

    def test_profile_loads_from_seeded_data(self) -> None:
        profile = load_json(profile_path(self.data_root), default_profile())
        self.assertTrue(profile["goals"])
        self.assertTrue(profile["questionnaire"])
        self.assertTrue(profile["apple_health"])
        self.assertTrue(profile["imports"])

    def test_gap_report_is_ready_with_seeded_data(self) -> None:
        report = gap_report(self.data_root)
        self.assertTrue(report["ready"])
        self.assertEqual(report["missing_data"], [])
        self.assertGreaterEqual(report["meal_days_logged"], 3)
        self.assertTrue(report["has_health_profile"])

    def test_analyze_active_experiment_with_seeded_checkins(self) -> None:
        experiments = load_json(experiments_path(self.data_root), {})
        active_id = experiments["active_experiment_id"]
        self.assertIsNotNone(active_id)
        analysis = analyze_experiment(self.data_root, active_id)
        self.assertGreater(analysis["checkin_count"], 0)
        self.assertIn("sleep_quality", analysis["average_primary_outcomes"])

    def test_analyze_completed_experiment_with_seeded_checkins(self) -> None:
        experiments = load_json(experiments_path(self.data_root), {})
        completed = [e for e in experiments["items"] if e["status"] == "completed"]
        self.assertGreater(len(completed), 0)
        analysis = analyze_experiment(self.data_root, completed[0]["id"])
        self.assertGreater(analysis["checkin_count"], 0)

    def test_checkin_experiment_ids_reference_valid_experiments(self) -> None:
        experiments = load_json(experiments_path(self.data_root), {})
        experiment_ids = {e["id"] for e in experiments["items"]}
        checkins = load_json(checkins_path(self.data_root), [])
        for checkin in checkins:
            self.assertIn(
                checkin["experiment_id"],
                experiment_ids,
                f"checkin {checkin['id']} references unknown experiment {checkin['experiment_id']}",
            )


if __name__ == "__main__":
    unittest.main()
