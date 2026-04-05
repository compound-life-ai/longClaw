# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Turri (package name: `compound-clawskill`) is an OpenClaw plugin that acts as a personal health agent. It registers 7 tools via the OpenClaw Plugin SDK that wrap deterministic Python scripts. The plugin provides meal logging, Whoop wearable integration, self-experiments, health news, and daily coaching via 10 specialist subagents.

## Common Commands

```bash
# Install dependencies
npm install

# Link plugin for local development
openclaw plugins install -l .
openclaw gateway restart

# Verify plugin
openclaw plugins inspect compound-clawskill
openclaw plugins doctor

# Run all Python tests
python3 -m unittest discover -s tests -v

# Run a single test file
python3 -m unittest tests/test_nutrition -v

# Run a single test method
python3 -m unittest tests.test_nutrition.TestNutrition.test_method_name -v
```

## Architecture

### Three-layer design: Skills -> Tools -> Scripts

1. **Skills** (`skills/`) — Agent-facing markdown prompts that guide when/how to use each tool. Registered in `openclaw.plugin.json`.
2. **Tools** (`index.ts`) — The SDK entry point. Registers 7 typed tools using `@sinclair/typebox` schemas. Each tool shells out to Python via `execFile`.
3. **Scripts** (`scripts/`) — Deterministic Python helpers that do the actual work. Each subdirectory maps to a tool domain: `nutrition/`, `health/`, `insights/`, `news/`, `coach/`, `common/`.

The flow is: User -> Skill routes intent -> Tool validates params -> Python script reads/writes `longevityOS-data/`.

### Key entry points

- `index.ts` — Single SDK entry point, registers all 7 tools. Uses `definePluginEntry` from `openclaw/plugin-sdk/plugin-entry`.
- `openclaw.plugin.json` — Plugin manifest declaring skills and config schema.
- `skill.md` — Root meta-skill that handles natural language routing to sub-skills.

### Data layer

All runtime data lives in `longevityOS-data/` (gitignored). Subdirectories: `nutrition/`, `health/`, `insights/`, `news/`. Seed data in `seed/` can bootstrap a fresh install. Python scripts accept `--data-root` to locate this directory.

### Tool-to-script mapping

| Tool | Python script(s) |
|------|------------------|
| `nutrition` | `scripts/nutrition/estimate_and_log.py`, `daily_summary.py`, `weekly_summary.py` |
| `health_profile` | `scripts/health/profile_store.py` |
| `whoop_initiate` | `scripts/health/import_whoop.py` |
| `whoop_sync` | `scripts/health/import_whoop.py` + `profile_store.py` (chained) |
| `experiments` | `scripts/insights/experiments.py` |
| `news_digest` | `scripts/news/fetch_digest.py` |
| `coaching_context` | `scripts/coach/daily_health_coach.py` |
| `learnings` | `scripts/common/learnings.py` |

### Specialist subagents

`agents/` contains 10 markdown prompt files for specialist subagents dispatched by the daily coach cron. Each agent analyzes data from its domain (nutrition, sleep, exercise, biomarkers, supplements, experiments, safety, etc.) and delivers coaching independently.

### Test conventions

Tests are in `tests/` using Python's `unittest`. Whoop API fixtures live in `tests/fixtures/whoop/`. Tests use sanitized real API responses. Each test file maps to a script domain (e.g., `test_nutrition.py` tests `scripts/nutrition/`).

### Temp file pattern in index.ts

Tools that pass JSON payloads to Python scripts use `withTempJson()` — writes params to a temp file, passes the path via `--input-json`, and cleans up after. This avoids shell escaping issues with complex JSON. On failure, the temp file is preserved as evidence in `longevityOS-data/debug/artifacts/`.

### Observability

All tool calls are logged to `longevityOS-data/debug/trace.jsonl` via OpenClaw plugin hooks registered in `index.ts`. The system tracks five layers: LLM output, SDK-delivered params (with auto-diff), execution result (with streak detection), script-level I/O, and preserved artifacts on failure. See `docs/observability.md` for the full guide including triangulation workflows and worked examples.
