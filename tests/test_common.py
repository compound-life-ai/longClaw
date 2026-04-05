from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

from scripts.common.paths import default_data_root, ensure_dir, repo_root
from scripts.common.storage import (
    append_csv_rows,
    ensure_csv_with_header,
    load_json,
    utc_now_iso,
    write_json,
)


class CommonPathTests(unittest.TestCase):
    def test_repo_root_and_default_data_root_point_into_repo(self) -> None:
        root = repo_root()
        self.assertTrue((root / "README.md").is_file())
        self.assertTrue((root / "snap").is_dir())
        self.assertEqual(default_data_root(), root / "longevityOS-data")

    def test_ensure_dir_creates_and_returns_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "nested" / "dir"
            result = ensure_dir(path)
            self.assertEqual(result, path)
            self.assertTrue(path.is_dir())


class CommonStorageTests(unittest.TestCase):
    def test_utc_now_iso_is_timezone_aware(self) -> None:
        value = utc_now_iso()
        self.assertTrue(value.endswith("+00:00"))

    def test_load_and_write_json_round_trip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "data.json"
            default = {"missing": True}
            self.assertEqual(load_json(path, default), default)

            payload = {"b": 2, "a": 1}
            write_json(path, payload)
            self.assertEqual(load_json(path, {}), payload)
            text = path.read_text(encoding="utf-8")
            self.assertTrue(text.endswith("\n"))

    def test_csv_helpers_write_header_once_and_append_rows(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "rows.csv"
            fieldnames = ["a", "b"]
            ensure_csv_with_header(path, fieldnames)
            ensure_csv_with_header(path, fieldnames)
            append_csv_rows(path, fieldnames, [{"a": "1", "b": "2"}, {"a": "3", "b": "4"}])

            with path.open("r", encoding="utf-8", newline="") as handle:
                rows = list(csv.reader(handle))

            self.assertEqual(rows[0], fieldnames)
            self.assertEqual(rows[1:], [["1", "2"], ["3", "4"]])


if __name__ == "__main__":
    unittest.main()
