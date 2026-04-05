from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from bin.health.import_whoop import (
    average,
    build_summary,
    build_summary_from_fixtures,
    ms_to_hours,
    normalize_body,
    normalize_cycles,
    normalize_recovery,
    normalize_sleep,
    normalize_workouts,
)
from bin.health.profile_store import (
    default_profile,
    merge_import,
    merge_questionnaire,
    profile_path,
    read_json,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = REPO_ROOT / "bin" / "tests" / "fixtures" / "whoop"


def load_fixture(name: str) -> dict:
    return json.loads((FIXTURE_DIR / f"{name}.json").read_text(encoding="utf-8"))


class WhoopNormalizationTests(unittest.TestCase):
    def test_average_helpers(self) -> None:
        self.assertEqual(average([]), 0.0)
        self.assertEqual(average([1.0, 2.0, 3.0]), 2.0)
        self.assertEqual(ms_to_hours(3_600_000), 1.0)
        self.assertEqual(ms_to_hours(0), 0.0)

    def test_normalize_recovery_from_fixture(self) -> None:
        records = load_fixture("recovery")["records"]
        result = normalize_recovery(records)
        self.assertEqual(result["days"], 4)
        self.assertGreater(result["recovery_score_avg"], 0)
        self.assertGreater(result["resting_heart_rate_avg"], 0)
        self.assertGreater(result["hrv_rmssd_avg"], 0)
        self.assertGreater(result["spo2_avg"], 0)
        self.assertGreater(result["skin_temp_celsius_avg"], 0)

    def test_normalize_sleep_from_fixture(self) -> None:
        records = load_fixture("sleep")["records"]
        result = normalize_sleep(records)
        self.assertEqual(result["days"], 4)
        self.assertGreater(result["daily_sleep_hours_avg"], 5.0)
        self.assertGreater(result["light_sleep_hours_avg"], 0)
        self.assertGreater(result["sws_hours_avg"], 0)
        self.assertGreater(result["rem_hours_avg"], 0)
        self.assertGreater(result["sleep_efficiency_avg"], 80.0)
        self.assertGreater(result["respiratory_rate_avg"], 10.0)

    def test_normalize_cycles_from_fixture(self) -> None:
        records = load_fixture("cycles")["records"]
        result = normalize_cycles(records)
        self.assertEqual(result["days"], 5)
        self.assertGreater(result["day_strain_avg"], 0)
        self.assertGreater(result["kilojoules_avg"], 0)
        self.assertGreater(result["average_heart_rate_avg"], 0)

    def test_normalize_workouts_from_fixture(self) -> None:
        records = load_fixture("workouts")["records"]
        result = normalize_workouts(records)
        self.assertEqual(result["workout_count"], 1)
        self.assertIn("assault-bike", result["by_sport"])
        self.assertGreater(result["average_strain"], 0)

    def test_normalize_body_from_fixture(self) -> None:
        data = load_fixture("body")
        result = normalize_body(data)
        self.assertEqual(result["height_m"], 1.76)
        self.assertEqual(result["weight_kg"], 66.0)
        self.assertEqual(result["max_heart_rate"], 188)

    def test_normalize_empty_records_returns_defaults(self) -> None:
        self.assertEqual(normalize_recovery([]), {})
        self.assertEqual(normalize_sleep([]), {})
        self.assertEqual(normalize_cycles([]), {})
        self.assertEqual(normalize_workouts([]), {"workout_count": 0, "by_sport": {}})

    def test_unscored_records_are_skipped(self) -> None:
        records = [{"score_state": "PENDING", "score": None}]
        self.assertEqual(normalize_recovery(records), {})
        self.assertEqual(normalize_sleep(records), {})
        self.assertEqual(normalize_cycles(records), {})

    def test_build_summary_from_fixtures(self) -> None:
        summary = build_summary_from_fixtures(FIXTURE_DIR)
        self.assertEqual(summary["source"], "whoop_api_v2")
        self.assertIn("recovery", summary)
        self.assertIn("sleep", summary)
        self.assertIn("strain", summary)
        self.assertIn("workouts", summary)
        self.assertIn("body", summary)
        self.assertIn("imported_at", summary)


class ProfileStoreTests(unittest.TestCase):
    def test_default_profile_has_whoop_key(self) -> None:
        profile = default_profile()
        self.assertIn("whoop", profile)
        self.assertNotIn("apple_health", profile)

    def test_merge_import_writes_whoop_data(self) -> None:
        profile = default_profile()
        summary = build_summary_from_fixtures(FIXTURE_DIR)
        profile = merge_import(profile, summary)
        self.assertEqual(profile["whoop"]["source"], "whoop_api_v2")
        self.assertGreater(profile["whoop"]["recovery"]["recovery_score_avg"], 0)
        self.assertTrue(profile["imports"])

    def test_profile_merges_questionnaire_and_import(self) -> None:
        profile = default_profile()
        profile = merge_questionnaire(
            profile,
            {
                "goals": ["better sleep"],
                "constraints": ["no late caffeine"],
                "preferences": {"language": "bilingual"},
                "questionnaire": {"sleep_notes": "wake up once"},
                "diet_notes": "more protein",
            },
        )
        profile = merge_import(profile, {"source": "whoop_api_v2"})
        self.assertEqual(profile["goals"], ["better sleep"])
        self.assertEqual(profile["constraints"], ["no late caffeine"])
        self.assertEqual(profile["preferences"]["language"], "bilingual")
        self.assertEqual(profile["questionnaire"]["diet_notes"], "more protein")
        self.assertTrue(profile["imports"])

    def test_read_json_rejects_non_object(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "bad.json"
            path.write_text(json.dumps(["not", "an", "object"]), encoding="utf-8")
            with self.assertRaises(ValueError):
                read_json(path)

    def test_profile_store_cli_round_trip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            questionnaire_path = data_root / "questionnaire.json"
            questionnaire_path.write_text(
                json.dumps(
                    {
                        "goals": ["better recovery"],
                        "questionnaire": {"training_notes": "hard sessions on Tue/Thu"},
                    }
                ),
                encoding="utf-8",
            )
            import_path = data_root / "whoop.json"
            import_path.write_text(
                json.dumps({"source": "whoop_api_v2"}),
                encoding="utf-8",
            )

            subprocess.run(
                [
                    sys.executable,
                    "bin/health/profile_store.py",
                    "--data-root",
                    str(data_root),
                    "merge-questionnaire",
                    "--input-json",
                    str(questionnaire_path),
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                [
                    sys.executable,
                    "bin/health/profile_store.py",
                    "--data-root",
                    str(data_root),
                    "merge-import",
                    "--input-json",
                    str(import_path),
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            show_result = subprocess.run(
                [
                    sys.executable,
                    "bin/health/profile_store.py",
                    "--data-root",
                    str(data_root),
                    "show",
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(show_result.stdout)
            self.assertEqual(payload["goals"], ["better recovery"])
            self.assertEqual(payload["imports"][0]["source"], "whoop_api_v2")


class ImportWhoopCLITests(unittest.TestCase):
    def test_cli_with_fixtures(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                "bin/health/import_whoop.py",
                "--fixture-dir",
                str(FIXTURE_DIR),
            ],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(payload["source"], "whoop_api_v2")
        self.assertGreater(payload["recovery"]["recovery_score_avg"], 0)
        self.assertGreater(payload["sleep"]["daily_sleep_hours_avg"], 0)
        self.assertGreater(payload["strain"]["day_strain_avg"], 0)
        self.assertEqual(payload["workouts"]["workout_count"], 1)
        self.assertEqual(payload["body"]["height_m"], 1.76)


if __name__ == "__main__":
    unittest.main()
