# Repository Guidelines

## Project Structure & Module Organization
`index.ts` is the single OpenClaw plugin entrypoint and registers the tool surface. Deterministic Python helpers live under `bin/` by domain: `nutrition/`, `health/`, `insights/`, `news/`, `coach/`, plus shared utilities in `bin/common/`. Skill prompts live in top-level directories (`snap/`, `health/`, `insights/`, `news/`, `daily-coach/`, `health-qa/`) as `SKILL.md` files, and the 10 specialist daily-coach prompts live in `agents/*.md`. Tests are in `bin/tests/`, with sanitized Whoop fixtures in `bin/tests/fixtures/whoop/`. Reference docs and demo assets are under `bin/docs/`, cron examples are in `bin/cron/`, and bootstrap data lives in `bin/seed/`.

## Build, Test, and Development Commands
Install JS dependencies with `npm install`. Link the plugin locally with `openclaw plugins install -l .`, then reload OpenClaw via `openclaw gateway restart`. Verify registration with `openclaw plugins inspect compound-clawskill` and run health checks with `openclaw plugins doctor`. Run the full test suite with `python3 -m unittest discover -s bin/tests -v`. For targeted work, use `python3 -m unittest bin.tests.test_nutrition -v` or a specific test method.

## Coding Style & Naming Conventions
Follow the existing style rather than reformatting unrelated code. TypeScript in `index.ts` uses 2-space indentation, double quotes, trailing commas, and small helper functions. Python uses 4-space indentation, type hints, `snake_case`, and deterministic CLI-style modules. Keep tool and script names aligned by domain, and prefer explicit names such as `merge_import`, `daily_summary`, or `fetch_digest`. New scripts should accept `--data-root` when they read or write repository-managed data.

## Testing Guidelines
This repo uses Python’s `unittest`; name new files `test_<domain>.py` and keep test classes and methods descriptive. Prefer tempfile-backed tests so they never depend on real user data. Add or update fixtures in `bin/tests/fixtures/` only with sanitized payloads. Every behavior change in `bin/` should ship with at least one focused test.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commits, often in Conventional Commit style such as `docs: add section to README` or `chore: update .gitignore`. Keep commits scoped to one concern. PRs should summarize the affected tool or script path, list the test command(s) you ran, and link the related issue when available. Include screenshots only when documentation images or user-facing output examples change.

## Observability & Debugging
All tool calls are traced to `longevityOS-data/debug/trace.jsonl` via OpenClaw plugin hooks in `index.ts`. Layers: `llm_output` (raw LLM tool calls), `before_tool` (SDK-delivered params + cross-layer diff), `after_tool` (result + streak detection), `script_io` (Python-level events from `estimate_and_log.py`, `import_whoop.py`, `fetch_digest.py`), `artifact` (preserved temp files on failure). Session bookends (`session_start`/`session_end`) provide per-session summaries. Python scripts receive correlation IDs via `LONGCLAW_RUN_ID`, `LONGCLAW_SESSION_ID`, `LONGCLAW_TOOL_CALL_ID` env vars. The `learnings` tool (backed by `bin/common/learnings.py`) provides search/log/read-trace commands for persistent debugging knowledge stored in `longevityOS-data/debug/learnings.jsonl`. Agent-facing debugging guidelines are in `skill.md` under "When a tool call fails". See `bin/docs/observability.md` for full details.

## Security & Data Handling
Do not commit `longevityOS-data/`, OAuth tokens, health exports, or other personal data. Treat `bin/seed/` and fixtures as sanitized examples only. When editing Whoop or coaching flows, preserve the current pattern of local-only storage and inspectable script output.
