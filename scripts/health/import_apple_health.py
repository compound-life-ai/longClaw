from __future__ import annotations

import argparse
import json
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))


SLEEP_TYPES = {
    "HKCategoryValueSleepAnalysisAsleep",
    "HKCategoryValueSleepAnalysisAsleepCore",
    "HKCategoryValueSleepAnalysisAsleepDeep",
    "HKCategoryValueSleepAnalysisAsleepREM",
    "HKCategoryValueSleepAnalysisAsleepUnspecified",
}

DAILY_SUM_TYPES = {
    "HKQuantityTypeIdentifierStepCount",
    "HKQuantityTypeIdentifierActiveEnergyBurned",
    "HKQuantityTypeIdentifierBasalEnergyBurned",
    "HKQuantityTypeIdentifierAppleExerciseTime",
    "HKQuantityTypeIdentifierDistanceWalkingRunning",
    "HKQuantityTypeIdentifierDistanceCycling",
}

SAMPLE_TYPES = {
    "HKQuantityTypeIdentifierRestingHeartRate": "resting_hr",
    "HKQuantityTypeIdentifierHeartRate": "heart_rate",
    "HKQuantityTypeIdentifierWalkingHeartRateAverage": "walking_heart_rate_avg",
    "HKQuantityTypeIdentifierHeartRateVariabilitySDNN": "heart_rate_variability_sdnn",
    "HKQuantityTypeIdentifierVO2Max": "vo2_max",
    "HKQuantityTypeIdentifierOxygenSaturation": "oxygen_saturation",
    "HKQuantityTypeIdentifierRespiratoryRate": "respiratory_rate",
}


def parse_dt(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S %z")


def average(values: list[float]) -> float:
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def safe_float(value: str | None) -> float:
    if value in (None, ""):
        return 0.0
    return float(value)


def workout_duration_minutes(workout: ET.Element) -> float:
    duration = safe_float(workout.attrib.get("duration"))
    unit = workout.attrib.get("durationUnit", "min")
    if unit == "min":
        return duration
    if unit in {"h", "hr", "hour"}:
        return duration * 60.0
    if unit in {"s", "sec", "second"}:
        return duration / 60.0
    return duration


def quantity_to_km(value: float, unit: str | None) -> float:
    if unit == "m":
        return value / 1000.0
    return value


def extract_export_xml_from_zip(zip_path: Path) -> Path:
    target_name = "apple_health_export/export.xml"
    with zipfile.ZipFile(zip_path) as archive:
        members = set(archive.namelist())
        if target_name not in members:
            raise FileNotFoundError(f"{target_name} not found in {zip_path}")
        temp_dir = Path(tempfile.mkdtemp(prefix="apple-health-export-"))
        archive.extract(target_name, path=temp_dir)
    return temp_dir / target_name


def resolve_input_xml(input_xml: Path | None, input_zip: Path | None) -> Path:
    if input_xml and input_zip:
        raise ValueError("use only one of --input-xml or --input-zip")
    if input_xml:
        return input_xml
    if input_zip:
        return extract_export_xml_from_zip(input_zip)
    raise ValueError("one of --input-xml or --input-zip is required")


def summarize_export(xml_path: Path) -> dict[str, Any]:
    step_days: dict[str, float] = defaultdict(float)
    sleep_days: dict[str, float] = defaultdict(float)
    active_energy_days: dict[str, float] = defaultdict(float)
    basal_energy_days: dict[str, float] = defaultdict(float)
    exercise_minutes_days: dict[str, float] = defaultdict(float)
    distance_walking_running_days: dict[str, float] = defaultdict(float)
    distance_cycling_days: dict[str, float] = defaultdict(float)
    workout_minutes: list[float] = []
    workout_type_counts: Counter[str] = Counter()
    sample_values: dict[str, list[float]] = defaultdict(list)

    record_count = 0
    workout_count = 0
    context = ET.iterparse(xml_path, events=("start", "end"))
    _, root = next(context)
    for event, elem in context:
        if event != "end":
            continue

        if elem.tag == "Record":
            record_count += 1
            record_type = elem.attrib.get("type")

            if record_type in DAILY_SUM_TYPES:
                value = safe_float(elem.attrib.get("value"))
                unit = elem.attrib.get("unit")
                start_date = elem.attrib.get("startDate")
                if start_date:
                    date_key = start_date[:10]
                    if record_type == "HKQuantityTypeIdentifierStepCount":
                        step_days[date_key] += value
                    elif record_type == "HKQuantityTypeIdentifierActiveEnergyBurned":
                        active_energy_days[date_key] += value
                    elif record_type == "HKQuantityTypeIdentifierBasalEnergyBurned":
                        basal_energy_days[date_key] += value
                    elif record_type == "HKQuantityTypeIdentifierAppleExerciseTime":
                        exercise_minutes_days[date_key] += value
                    elif record_type == "HKQuantityTypeIdentifierDistanceWalkingRunning":
                        distance_walking_running_days[date_key] += quantity_to_km(value, unit)
                    elif record_type == "HKQuantityTypeIdentifierDistanceCycling":
                        distance_cycling_days[date_key] += quantity_to_km(value, unit)
            elif record_type == "HKCategoryTypeIdentifierSleepAnalysis":
                if elem.attrib.get("value") in SLEEP_TYPES:
                    start_date = elem.attrib.get("startDate")
                    end_date = elem.attrib.get("endDate")
                    if start_date and end_date:
                        start = parse_dt(start_date)
                        end = parse_dt(end_date)
                        hours = max((end - start).total_seconds() / 3600.0, 0.0)
                        sleep_days[start.date().isoformat()] += hours
            elif record_type in SAMPLE_TYPES:
                value = safe_float(elem.attrib.get("value"))
                sample_values[SAMPLE_TYPES[record_type]].append(value)

            elem.clear()
            if record_count % 5000 == 0:
                root.clear()

        elif elem.tag == "Workout":
            workout_count += 1
            workout_minutes.append(workout_duration_minutes(elem))
            workout_type = elem.attrib.get("workoutActivityType")
            if workout_type:
                workout_type_counts[workout_type] += 1
            elem.clear()

    step_values = list(step_days.values())
    sleep_values = [round(value, 2) for value in sleep_days.values()]
    active_energy_values = list(active_energy_days.values())
    basal_energy_values = list(basal_energy_days.values())
    exercise_minutes_values = list(exercise_minutes_days.values())
    walking_running_distance_values = list(distance_walking_running_days.values())
    cycling_distance_values = list(distance_cycling_days.values())
    heart_rate = sample_values["heart_rate"]
    resting_hr = sample_values["resting_hr"]

    summary = {
        "imported_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "source": "apple_health_export_xml",
        "file_name": xml_path.name,
        "counts": {
            "records": record_count,
            "workouts": workout_count,
            "days_with_steps": len(step_days),
            "days_with_sleep": len(sleep_days),
        },
        "activity": {
            "daily_steps_avg": round(average(step_values)),
            "daily_active_energy_kcal_avg": round(average(active_energy_values), 2),
            "daily_basal_energy_kcal_avg": round(average(basal_energy_values), 2),
            "daily_exercise_minutes_avg": round(average(exercise_minutes_values), 2),
            "daily_walking_running_distance_avg_km": round(
                average(walking_running_distance_values), 2
            ),
            "daily_cycling_distance_avg_km": round(average(cycling_distance_values), 2),
            "step_days": len(step_days),
        },
        "sleep": {
            "daily_sleep_hours_avg": round(average(sleep_values), 2),
            "sleep_days": len(sleep_days),
            "daily_sleep_hours_values": sleep_values[-14:],
        },
        "heart": {
            "resting_heart_rate_avg": round(average(resting_hr), 2),
            "heart_rate_avg": round(average(heart_rate), 2),
            "walking_heart_rate_avg": round(
                average(sample_values["walking_heart_rate_avg"]), 2
            ),
            "heart_rate_variability_sdnn_avg": round(
                average(sample_values["heart_rate_variability_sdnn"]), 2
            ),
            "oxygen_saturation_avg": round(
                average(sample_values["oxygen_saturation"]), 2
            ),
            "respiratory_rate_avg": round(
                average(sample_values["respiratory_rate"]), 2
            ),
            "vo2_max_avg": round(average(sample_values["vo2_max"]), 2),
            "sample_count": len(resting_hr) + len(heart_rate),
        },
        "workouts": {
            "workout_count": workout_count,
            "average_workout_minutes": round(average(workout_minutes), 2),
            "by_type": dict(sorted(workout_type_counts.items())),
        },
    }
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Summarize Apple Health export XML.")
    parser.add_argument("--input-xml", type=Path)
    parser.add_argument("--input-zip", type=Path)
    args = parser.parse_args()

    xml_path = resolve_input_xml(args.input_xml, args.input_zip)
    print(json.dumps(summarize_export(xml_path), ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
