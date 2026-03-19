from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

from scripts.health.import_apple_health import (
    average,
    extract_export_xml_from_zip,
    parse_dt,
    resolve_input_xml,
    summarize_export,
)
from scripts.health.profile_store import (
    default_profile,
    merge_import,
    merge_questionnaire,
    profile_path,
    read_json,
)


REPO_ROOT = Path(__file__).resolve().parents[1]


APPLE_XML = """<?xml version="1.0" encoding="UTF-8"?>
<HealthData>
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="Apple Watch" unit="count" value="8000" startDate="2026-03-17 09:00:00 -0700" endDate="2026-03-17 10:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="Apple Watch" unit="count" value="4000" startDate="2026-03-18 09:00:00 -0700" endDate="2026-03-18 10:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned" sourceName="Apple Watch" unit="kcal" value="520" startDate="2026-03-17 09:00:00 -0700" endDate="2026-03-17 10:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierBasalEnergyBurned" sourceName="Apple Watch" unit="kcal" value="1600" startDate="2026-03-17 00:00:00 -0700" endDate="2026-03-17 23:59:59 -0700" />
  <Record type="HKQuantityTypeIdentifierAppleExerciseTime" sourceName="Apple Watch" unit="min" value="45" startDate="2026-03-17 09:00:00 -0700" endDate="2026-03-17 10:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierDistanceWalkingRunning" sourceName="Apple Watch" unit="m" value="6200" startDate="2026-03-17 09:00:00 -0700" endDate="2026-03-17 10:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierDistanceCycling" sourceName="Apple Watch" unit="m" value="14000" startDate="2026-03-17 11:00:00 -0700" endDate="2026-03-17 12:00:00 -0700" />
  <Record type="HKCategoryTypeIdentifierSleepAnalysis" sourceName="Apple Watch" value="HKCategoryValueSleepAnalysisAsleep" startDate="2026-03-17 23:00:00 -0700" endDate="2026-03-18 06:30:00 -0700" />
  <Record type="HKQuantityTypeIdentifierRestingHeartRate" sourceName="Apple Watch" unit="count/min" value="58" startDate="2026-03-18 08:00:00 -0700" endDate="2026-03-18 08:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierHeartRate" sourceName="Apple Watch" unit="count/min" value="101" startDate="2026-03-18 08:10:00 -0700" endDate="2026-03-18 08:10:00 -0700" />
  <Record type="HKQuantityTypeIdentifierWalkingHeartRateAverage" sourceName="Apple Watch" unit="count/min" value="92" startDate="2026-03-18 08:30:00 -0700" endDate="2026-03-18 08:30:00 -0700" />
  <Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN" sourceName="Apple Watch" unit="ms" value="52" startDate="2026-03-18 06:45:00 -0700" endDate="2026-03-18 06:45:00 -0700" />
  <Record type="HKQuantityTypeIdentifierVO2Max" sourceName="Apple Watch" unit="mL/min·kg" value="41.5" startDate="2026-03-18 09:00:00 -0700" endDate="2026-03-18 09:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierOxygenSaturation" sourceName="Apple Watch" unit="%" value="0.98" startDate="2026-03-18 07:00:00 -0700" endDate="2026-03-18 07:00:00 -0700" />
  <Record type="HKQuantityTypeIdentifierRespiratoryRate" sourceName="Apple Watch" unit="count/min" value="14.2" startDate="2026-03-18 07:30:00 -0700" endDate="2026-03-18 07:30:00 -0700" />
  <Workout workoutActivityType="HKWorkoutActivityTypeRunning" duration="45" durationUnit="min" startDate="2026-03-18 07:00:00 -0700" endDate="2026-03-18 07:45:00 -0700" />
  <Workout workoutActivityType="HKWorkoutActivityTypeWalking" duration="1.5" durationUnit="h" startDate="2026-03-18 12:00:00 -0700" endDate="2026-03-18 13:30:00 -0700" />
</HealthData>
"""


class HealthScriptTests(unittest.TestCase):
    def test_parse_dt_and_average_helpers(self) -> None:
        parsed = parse_dt("2026-03-18 08:00:00 -0700")
        self.assertEqual(parsed.year, 2026)
        self.assertEqual(average([]), 0.0)
        self.assertEqual(average([1.0, 2.0, 3.0]), 2.0)

    def test_zip_helpers_extract_and_resolve_xml(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            xml_path = tmp_path / "apple_health_export" / "export.xml"
            xml_path.parent.mkdir(parents=True, exist_ok=True)
            xml_path.write_text(APPLE_XML, encoding="utf-8")
            zip_path = tmp_path / "export.zip"
            with zipfile.ZipFile(zip_path, "w") as archive:
                archive.write(xml_path, arcname="apple_health_export/export.xml")

            extracted = extract_export_xml_from_zip(zip_path)
            self.assertTrue(extracted.exists())
            self.assertEqual(resolve_input_xml(None, zip_path).name, "export.xml")
            self.assertEqual(resolve_input_xml(xml_path, None), xml_path)
            with self.assertRaises(ValueError):
                resolve_input_xml(xml_path, zip_path)

    def test_apple_health_summary_extracts_basics(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            xml_path = Path(tmp_dir) / "export.xml"
            xml_path.write_text(APPLE_XML, encoding="utf-8")
            summary = summarize_export(xml_path)
            self.assertEqual(summary["counts"]["days_with_steps"], 2)
            self.assertGreater(summary["sleep"]["daily_sleep_hours_avg"], 7.0)
            self.assertEqual(summary["heart"]["resting_heart_rate_avg"], 58.0)
            self.assertEqual(summary["heart"]["heart_rate_avg"], 101.0)
            self.assertEqual(summary["heart"]["walking_heart_rate_avg"], 92.0)
            self.assertEqual(summary["heart"]["heart_rate_variability_sdnn_avg"], 52.0)
            self.assertEqual(summary["heart"]["vo2_max_avg"], 41.5)
            self.assertEqual(summary["heart"]["oxygen_saturation_avg"], 0.98)
            self.assertEqual(summary["heart"]["respiratory_rate_avg"], 14.2)
            self.assertEqual(summary["activity"]["daily_active_energy_kcal_avg"], 520.0)
            self.assertEqual(summary["activity"]["daily_basal_energy_kcal_avg"], 1600.0)
            self.assertEqual(summary["activity"]["daily_exercise_minutes_avg"], 45.0)
            self.assertEqual(summary["activity"]["daily_walking_running_distance_avg_km"], 6.2)
            self.assertEqual(summary["activity"]["daily_cycling_distance_avg_km"], 14.0)
            self.assertEqual(summary["workouts"]["workout_count"], 2)
            self.assertEqual(summary["workouts"]["average_workout_minutes"], 67.5)
            self.assertEqual(summary["workouts"]["by_type"]["HKWorkoutActivityTypeRunning"], 1)
            self.assertEqual(summary["workouts"]["by_type"]["HKWorkoutActivityTypeWalking"], 1)

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
        profile = merge_import(profile, {"source": "apple_health_export_xml", "file_name": "export.xml"})
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
            import_path = data_root / "apple.json"
            import_path.write_text(
                json.dumps({"source": "apple_health_export_xml", "file_name": "export.xml"}),
                encoding="utf-8",
            )

            subprocess.run(
                [
                    sys.executable,
                    "scripts/health/profile_store.py",
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
                    "scripts/health/profile_store.py",
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
                    "scripts/health/profile_store.py",
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
            self.assertEqual(payload["imports"][0]["file_name"], "export.xml")

    def test_import_apple_health_cli_outputs_summary(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            xml_path = Path(tmp_dir) / "export.xml"
            xml_path.write_text(APPLE_XML, encoding="utf-8")
            result = subprocess.run(
                [
                    sys.executable,
                    "scripts/health/import_apple_health.py",
                    "--input-xml",
                    str(xml_path),
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertEqual(payload["file_name"], "export.xml")
            self.assertEqual(payload["counts"]["workouts"], 2)
            self.assertEqual(payload["heart"]["vo2_max_avg"], 41.5)

    def test_import_apple_health_cli_accepts_zip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            xml_dir = tmp_path / "apple_health_export"
            xml_dir.mkdir(parents=True, exist_ok=True)
            xml_path = xml_dir / "export.xml"
            xml_path.write_text(APPLE_XML, encoding="utf-8")
            zip_path = tmp_path / "export.zip"
            with zipfile.ZipFile(zip_path, "w") as archive:
                archive.write(xml_path, arcname="apple_health_export/export.xml")

            result = subprocess.run(
                [
                    sys.executable,
                    "scripts/health/import_apple_health.py",
                    "--input-zip",
                    str(zip_path),
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertEqual(payload["file_name"], "export.xml")
            self.assertEqual(payload["workouts"]["workout_count"], 2)


if __name__ == "__main__":
    unittest.main()
