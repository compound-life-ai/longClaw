from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from bin.common.storage import write_json
from bin.insights.experiments import (
    add_checkin,
    analyze_experiment,
    checkins_path,
    count_meal_days,
    create_experiment,
    default_checkins,
    default_experiments,
    experiments_path,
    gap_report,
    load_input,
    meals_path,
)


REPO_ROOT = Path(__file__).resolve().parents[1]


class InsightsScriptTests(unittest.TestCase):
    def test_defaults_and_load_input(self) -> None:
        self.assertEqual(default_experiments(), {"active_experiment_id": None, "items": []})
        self.assertEqual(default_checkins(), [])
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "input.json"
            path.write_text(json.dumps({"ok": True}), encoding="utf-8")
            self.assertEqual(load_input(path), {"ok": True})
            path.write_text(json.dumps(["bad"]), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_input(path)

    def test_create_and_analyze_experiment(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            experiment = create_experiment(
                data_root,
                {
                    "title": "Earlier caffeine cutoff",
                    "domain": "sleep",
                    "hypothesis": "Stopping caffeine at noon improves sleep quality.",
                    "null_hypothesis": "Stopping caffeine at noon does not change sleep quality.",
                    "intervention": "No caffeine after 12:00.",
                    "primary_outcome": "sleep_quality",
                },
            )
            for score in (6, 7, 8):
                add_checkin(
                    data_root,
                    {
                        "experiment_id": experiment["id"],
                        "compliance": 1,
                        "primary_outcome_scores": {"sleep_quality": score},
                    },
                )

            analysis = analyze_experiment(data_root, experiment["id"])
            self.assertEqual(analysis["status"], "ready-for-review")
            self.assertEqual(analysis["average_primary_outcomes"]["sleep_quality"], 7.0)
            self.assertEqual(analysis["average_compliance"], 1.0)
            self.assertTrue(experiments_path(data_root).exists())
            self.assertTrue(checkins_path(data_root).exists())

    def test_gap_report_requests_more_data(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            report = gap_report(data_root)
            self.assertFalse(report["ready"])
            self.assertGreaterEqual(len(report["missing_data"]), 2)

    def test_count_meal_days_and_gap_report_ready_state(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            meal_path = meals_path(data_root)
            meal_path.parent.mkdir(parents=True, exist_ok=True)
            meal_path.write_text(
                "\n".join(
                    [
                        "timestamp,date,meal_id,meal_type,source,ingredient_name,portion_text,calories_kcal,protein_g,carbs_g,fat_g,fiber_g,micronutrients_json,ingredient_confidence,meal_confidence,notes,photo_ref",
                        '2026-03-16T08:00:00+00:00,2026-03-16,m1,breakfast,manual,oats,1 bowl,200,8,34,4,5,"{}",0.8,0.8,,',
                        '2026-03-17T08:00:00+00:00,2026-03-17,m2,breakfast,manual,eggs,2,160,12,1,11,0,"{}",0.8,0.8,,',
                        '2026-03-18T08:00:00+00:00,2026-03-18,m3,breakfast,manual,yogurt,1 cup,120,15,10,3,0,"{}",0.8,0.8,,',
                    ]
                ),
                encoding="utf-8",
            )
            write_json(
                data_root / "health" / "profile.json",
                {"questionnaire": {"goal": "sleep"}, "whoop": {"source": "whoop_api_v2"}},
            )
            self.assertEqual(count_meal_days(data_root), 3)
            report = gap_report(data_root)
            self.assertTrue(report["ready"])
            self.assertEqual(report["missing_data"], [])

    def test_validation_errors_and_needs_more_data_state(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            with self.assertRaises(ValueError):
                create_experiment(data_root, {"title": "missing rest"})
            experiment = create_experiment(
                data_root,
                {
                    "title": "Morning walk",
                    "domain": "energy",
                    "hypothesis": "Morning walks improve energy.",
                    "null_hypothesis": "Morning walks do not improve energy.",
                    "intervention": "20-minute morning walk.",
                    "primary_outcome": "energy",
                },
            )
            with self.assertRaises(ValueError):
                add_checkin(
                    data_root,
                    {
                        "experiment_id": experiment["id"],
                        "compliance": 1,
                        "primary_outcome_scores": [],
                    },
                )
            add_checkin(
                data_root,
                {
                    "experiment_id": experiment["id"],
                    "compliance": 0.5,
                    "primary_outcome_scores": {"energy": 6},
                },
            )
            analysis = analyze_experiment(data_root, experiment["id"])
            self.assertEqual(analysis["status"], "needs-more-data")
            with self.assertRaises(ValueError):
                analyze_experiment(data_root, "missing-id")

    def test_cli_gap_report_and_create(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_root = Path(tmp_dir)
            experiment_path = data_root / "experiment.json"
            experiment_path.write_text(
                json.dumps(
                    {
                        "title": "Earlier dinner",
                        "domain": "sleep",
                        "hypothesis": "Earlier dinner improves sleep onset.",
                        "null_hypothesis": "Earlier dinner does not improve sleep onset.",
                        "intervention": "Finish dinner by 7pm.",
                        "primary_outcome": "sleep_onset",
                    }
                ),
                encoding="utf-8",
            )
            create_result = subprocess.run(
                [
                    sys.executable,
                    "bin/insights/experiments.py",
                    "--data-root",
                    str(data_root),
                    "create",
                    "--input-json",
                    str(experiment_path),
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            gap_result = subprocess.run(
                [
                    sys.executable,
                    "bin/insights/experiments.py",
                    "--data-root",
                    str(data_root),
                    "gap-report",
                ],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            created = json.loads(create_result.stdout)
            gap = json.loads(gap_result.stdout)
            self.assertEqual(created["title"], "Earlier dinner")
            self.assertEqual(gap["active_experiment_id"], created["id"])


if __name__ == "__main__":
    unittest.main()
