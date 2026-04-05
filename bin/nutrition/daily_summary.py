from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))

from bin.common.paths import default_data_root
from bin.nutrition.estimate_and_log import summarize_day


def main() -> int:
    parser = argparse.ArgumentParser(description="Print daily nutrition totals.")
    parser.add_argument("--date", required=True, help="ISO date, e.g. 2026-03-18.")
    parser.add_argument("--data-root", type=Path, default=default_data_root())
    args = parser.parse_args()

    print(json.dumps(summarize_day(args.data_root, args.date), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
