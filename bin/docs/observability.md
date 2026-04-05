# LongClaw Observability

Structured logging for debugging LongClaw tool calls in production.
All logs go to `longevityOS-data/debug/trace.jsonl` as append-only JSONL,
correlated by IDs that OpenClaw provides at every hook.

## Why This Exists

LongClaw has a blind spot between the LLM and our code. When the LLM
generates a tool call, the arguments pass through the OpenClaw SDK before
reaching our `execute()` function. Without logging at each boundary, you
can't tell whether a bug is in the LLM output, the SDK processing, or
our scripts.

Real example: Bug #8 — `input_json` arrived as `{}` on every meal log,
causing 10+ consecutive failures. Without cross-layer logging, the root
cause was misdiagnosed as a TypeBox bug in the SDK. The real cause (LLM
vs SDK) remains unknown because no production logs existed.

## Architecture

```
  LLM generates tool call
         |
         v
  +--------------------------+
  | LAYER -1: llm_output     |  What the model actually generated
  | hook: llm_output         |  (raw tool_use blocks with arguments)
  +--------------------------+
         |
         v
  +--------------------------+
  | LAYER 0: before_tool     |  What the SDK passed to execute()
  | hook: before_tool_call   |  + DIFF against layer -1
  +--------------------------+
         |
         v
  +--------------------------+
  | LAYER 1: after_tool      |  Result, error, duration
  | hook: after_tool_call    |  + STREAK detection
  +--------------------------+
         |
         v
  +--------------------------+
  | LAYER 2: script_io       |  Internal script events
  | Python: debug_log.py     |  (only 3 scripts instrumented)
  +--------------------------+
         |
         v
  +--------------------------+
  | LAYER 3: artifact        |  Preserved temp files on failure
  | TS: withTempJson()       |  (evidence that would be deleted)
  +--------------------------+

  SESSION BOOKENDS:
  session_start  -->  ... layers above ...  -->  session_end (summary)
```

## Correlation IDs

Every log entry carries IDs provided by OpenClaw. No custom ID generation.

```
sessionId    Ephemeral UUID per conversation. Regenerated on /new, /reset.
             Use to filter: "everything in this chat session."

sessionKey   Stable key per channel/workspace. Persists across resets.
             Use to filter: "all sessions from Telegram" or "all cron runs."

runId        One LLM turn. May produce multiple tool calls.
             Use to filter: "the LLM response and all tools it triggered."

toolCallId   One specific tool execution.
             Use to filter: "this exact nutrition/log call."
```

Hierarchy:

```
sessionKey (stable, per channel)
  +-- sessionId (per conversation)
        +-- runId (per LLM turn)
              +-- toolCallId (per tool call)
```

## Log Layers in Detail

### Layer -1: llm_output

Logged by the `llm_output` hook. Captures what the LLM generated.

```jsonl
{"ts":"...","layer":"llm_output","runId":"r_7f2a","sessionId":"s_abc1",
 "provider":"anthropic","model":"claude-sonnet-4-20250514",
 "toolCalls":[{"name":"nutrition","arguments":{"command":"log","input_json":{"ingredients":[...]}}}],
 "usage":{"input":3200,"output":480}}
```

Key fields:
- `toolCalls` — extracted from the raw assistant message. Shows what the
  LLM intended to pass as arguments. Compare with layer 0 to detect SDK
  mutations.
- `provider` / `model` — which LLM generated this. Useful for
  provider-specific bugs.
- `usage` — token counts for cost tracking.

### Layer 0: before_tool

Logged by the `before_tool_call` hook. Captures what `execute()` receives
after SDK processing.

```jsonl
{"ts":"...","layer":"before_tool","runId":"r_7f2a","sessionId":"s_abc1",
 "toolCallId":"tc_9x3k","toolName":"nutrition",
 "params":{"command":"log","input_json":{}},
 "llm_diff":{"input_json":{"llm":{"ingredients":["..."]},"sdk":{}}}}
```

Key fields:
- `params` — the actual params passed to execute().
- `llm_diff` — auto-computed diff between what the LLM sent (layer -1)
  and what the SDK delivered. Only present when they differ. This is the
  field that would have solved Bug #8 instantly.

### Layer 1: after_tool

Logged by the `after_tool_call` hook. Captures execution outcome.

```jsonl
{"ts":"...","layer":"after_tool","runId":"r_7f2a","sessionId":"s_abc1",
 "toolCallId":"tc_9x3k","toolName":"nutrition",
 "durationMs":265,"error":"ValueError: payload.ingredients must be non-empty",
 "streak":{"consecutive_failures":10,"since":"2026-04-03T10:15:00Z",
           "same_error":true,"pattern":"consistent_failure"}}
```

Key fields:
- `error` — null on success, error message on failure.
- `durationMs` — execution time. Anomalous durations signal network
  issues or data scaling problems.
- `streak` — only present when consecutive failures detected for the
  same tool. Fields:
  - `consecutive_failures` — count since last success
  - `same_error` — whether all failures have the same error message
  - `pattern` — `"consistent_failure"` (3+) or `"recurring"`

### Layer 2: script_io

Logged by Python scripts via `bin/common/debug_log.py`. Only the
three scripts with blind spots are instrumented:

| Script | Events logged | Why instrumented |
|--------|---------------|------------------|
| `estimate_and_log.py` | `input_loaded`, `enrichment_done`, `csv_written` | Temp file deleted after execution; enrichment decisions invisible to hooks |
| `import_whoop.py` | `token_check`, `token_refresh`, `api_fetch` | Multi-step auth + 5 API calls, each can fail independently |
| `fetch_digest.py` | `feed_fetch`, `ranked` | Multiple RSS feeds, partial success is normal |

Scripts NOT instrumented (hooks are sufficient):
`experiments.py`, `profile_store.py`, `daily_health_coach.py`,
`daily_summary.py`, `weekly_summary.py`.

```jsonl
{"ts":"...","layer":"script_io","runId":"r_7f2a","sessionId":"s_abc1",
 "toolCallId":"tc_9x3k","script":"estimate_and_log","event":"input_loaded",
 "ingredient_count":3,"payload_keys":["ingredients","meal_name","timestamp"]}
```

Correlation: Python scripts read `LONGCLAW_RUN_ID`, `LONGCLAW_SESSION_ID`,
and `LONGCLAW_TOOL_CALL_ID` from environment variables set by `index.ts`.

### Layer 3: artifact

Logged when `withTempJson()` catches an error. The temp file (normally
deleted) is copied to `longevityOS-data/debug/artifacts/` before cleanup.

```jsonl
{"ts":"...","layer":"artifact","label":"r_7f2a-tc_9x3k",
 "dest":"longevityOS-data/debug/artifacts/r_7f2a-tc_9x3k.json",
 "content":{},"preserved_because":"execution_failed"}
```

Without this, the temp file is destroyed in the `finally` block —
taking the evidence with it.

### Session bookends

```jsonl
{"ts":"...","layer":"session_start","sessionId":"s_abc1",
 "sessionKey":"telegram-ian","resumedFrom":null}

{"ts":"...","layer":"session_end","sessionId":"s_abc1",
 "sessionKey":"telegram-ian","messageCount":24,"durationMs":45000,
 "toolSummary":{"total":12,"succeeded":10,"failed":2,
   "failures":[
     {"tool":"whoop_sync","error":"401 Unauthorized"},
     {"tool":"nutrition","error":"ValueError: ingredients empty"}]},
 "activeStreaks":{"nutrition":{"count":10,"error":"ValueError: ...","since":"..."}}}
```

The `session_end` entry is the starting point for any investigation.
Read one line and know where to dig.

## How to Triangulate Issues

### Step 1: Find the session

```bash
# What went wrong today?
grep '"session_end"' trace.jsonl | tail -5

# Filter by channel
grep '"telegram-ian"' trace.jsonl | grep '"session_end"'

# Filter by cron
grep '"cron-coach"' trace.jsonl | grep '"session_end"'
```

Read `toolSummary.failures` and `activeStreaks` to identify which tool
is broken.

### Step 2: Trace a specific failure

```bash
# Get all events for a run (one LLM turn + its tool calls)
grep '"r_7f2a"' trace.jsonl
```

This gives you the full pipeline for one request:

```
llm_output    ->  What the LLM generated
before_tool   ->  What execute() received (+ llm_diff if different)
script_io     ->  What the Python script saw internally
after_tool    ->  Pass/fail, duration, streak
artifact      ->  Preserved temp file (if failed)
```

### Step 3: Cross-layer diff

The `llm_diff` field in `before_tool` entries is the fastest path to
root cause for data-loss bugs:

```bash
# Find all tool calls where LLM args differed from SDK params
grep '"llm_diff"' trace.jsonl
```

Interpretation:
- `llm_diff` present, LLM had data, SDK has `{}` -> SDK is stripping it
- `llm_diff` absent, params show `{}` -> LLM never sent the data
- `llm_diff` absent, params have data -> working correctly

### Step 4: Check for patterns

```bash
# Find streak warnings (consecutive failures)
grep '"streak"' trace.jsonl

# Find all failures for a specific tool
grep '"nutrition"' trace.jsonl | grep '"error"'

# Find artifact files (preserved evidence)
grep '"artifact"' trace.jsonl
ls longevityOS-data/debug/artifacts/
```

### Worked example: Bug #8 (empty input_json)

```bash
# 1. session_end shows: nutrition failed 10 times
grep '"session_end"' trace.jsonl | tail -1
#    -> toolSummary.failures: [{"tool":"nutrition","error":"ValueError: ..."}]
#    -> activeStreaks: {"nutrition":{"count":10,...}}

# 2. Pick any failing runId from the session
grep '"nutrition"' trace.jsonl | grep '"after_tool"' | grep '"error"' | head -1
#    -> runId: "r_7f2a"

# 3. Trace the full pipeline
grep '"r_7f2a"' trace.jsonl
#    llm_output:   toolCalls[0].arguments.input_json = {ingredients: [...]}
#    before_tool:  params.input_json = {}
#                  llm_diff: {input_json: {llm: {ingredients:[...]}, sdk: {}}}
#    after_tool:   error = "ValueError: ingredients empty"
#    artifact:     preserved at debug/artifacts/r_7f2a-tc_9x3k.json

# 4. Conclusion: LLM sent data, SDK delivered {}. Bug is in the SDK.
```

### Worked example: Whoop token expiry

```bash
# 1. session_end shows whoop_sync failed
grep '"session_end"' trace.jsonl | tail -1
#    -> failures: [{"tool":"whoop_sync","error":"401 Unauthorized"}]

# 2. Check script-level detail
grep '"import_whoop"' trace.jsonl | tail -5
#    token_check:   status: "expired"
#    token_refresh:  status: "failed", error: "401 – refresh token expired"

# 3. Check when it last worked
grep '"whoop_sync"' trace.jsonl | grep '"after_tool"' | grep -v '"error"' | tail -1
#    -> ts: "2026-03-03T07:10:02Z" (33 days ago)

# 4. Conclusion: both tokens expired. User must re-authenticate.
```

### Worked example: RSS feed partial failure

```bash
# 1. Check feed-level results
grep '"feed_fetch"' trace.jsonl | tail -10
#    Fight Aging!:          status: "ok", items: 15
#    NIA:                   status: "ok", items: 8
#    ScienceDaily:          status: "error", error: "URLError: timed out"

# 2. Check if this is recurring
grep '"ScienceDaily"' trace.jsonl | grep '"error"' | wc -l
#    -> 7 (recurring timeout)

# 3. Conclusion: ScienceDaily feed is unreliable. Consider removing or
#    adding a shorter timeout.
```

## File & Function Index

### TypeScript (index.ts)

| Function | Line | Purpose |
|----------|------|---------|
| `appendLog()` | ~35 | Append one JSONL entry to trace.jsonl |
| `diffParams()` | ~45 | Shallow diff between LLM args and SDK params |
| `extractToolCalls()` | ~60 | Parse tool_use blocks from raw LLM response |
| `debugEnv()` | ~120 | Build env vars for Python subprocess correlation |
| `withTempJson()` | ~100 | Write temp JSON, preserve as artifact on failure |
| Hook: `session_start` | ~140 | Reset session stats, log session start |
| Hook: `llm_output` | ~148 | Store tool call args, log LLM response |
| Hook: `before_tool_call` | ~162 | Store run context, compute llm_diff, log |
| Hook: `after_tool_call` | ~180 | Streak detection, session stats, log, cleanup |
| Hook: `session_end` | ~210 | Log session summary with tool stats |

### Python (bin/common/debug_log.py)

| Function | Purpose |
|----------|---------|
| `log_event(script, event, *, data_root, **kwargs)` | Append one script_io entry to trace.jsonl |

### Python (bin/common/learnings.py)

| Function | Purpose |
|----------|---------|
| `search_learnings(data_root, type_filter, query, limit)` | Search with confidence decay + dedup |
| `log_learning(data_root, payload)` | Validate and append a learning entry |
| `read_trace(data_root, run_id)` | Read trace entries for a specific runId |
| `dedupe_learnings(entries)` | Latest-wins dedup by key+type |
| `apply_confidence_decay(entry)` | -1 confidence per 30 days for observed/inferred |

### Instrumented scripts

| Script | Events | What they capture |
|--------|--------|-------------------|
| `bin/nutrition/estimate_and_log.py` | `input_loaded` | Ingredient count, payload keys |
| | `enrichment_done` | Catalog hits vs LLM estimates |
| | `csv_written` | Rows written, file path |
| `bin/health/import_whoop.py` | `token_check` | Token valid or expired |
| | `token_refresh` | Refresh succeeded or failed |
| | `api_fetch` | Endpoint, record count |
| `bin/news/fetch_digest.py` | `feed_fetch` | Per-source success/failure, item count |
| | `ranked` | Total items, returned count |

## Learnings System

Persistent JSONL store at `longevityOS-data/debug/learnings.jsonl`.
Agents search at session start and log after resolving issues.

### Tool interface

The `learnings` tool (registered in `index.ts`) exposes three commands:

| Command | What it does |
|---------|-------------|
| `search` | Search existing learnings by type, keyword, or both |
| `log` | Append a new learning entry |
| `read_trace` | Read trace.jsonl entries for a specific runId |

### Learning schema

```jsonl
{"ts":"2026-04-05T09:00:00Z","skill":"investigate","type":"pitfall",
 "key":"whoop-token-expiry",
 "insight":"Whoop refresh tokens expire after ~30 days of inactivity",
 "confidence":8,"source":"observed",
 "files":["bin/health/import_whoop.py"]}
```

Types: `pattern`, `pitfall`, `preference`, `architecture`, `tool`, `operational`

Sources: `observed` (verified in code), `user-stated`, `inferred`

### Confidence decay

`observed` and `inferred` learnings lose 1 confidence point per 30 days.
This ensures stale learnings fade naturally. `user-stated` learnings
don't decay.

### Deduplication

Append-only storage, deduped at read time. When multiple entries share
the same `key` + `type`, the latest one wins. This means updating a
learning is just logging a new entry with the same key.

### Agent guidelines

The meta-skill (`skill.md`) instructs agents to:
1. Search learnings BEFORE debugging a new issue
2. Log discoveries AFTER resolving an issue
3. Reference prior learnings when they apply ("Prior learning applied: [key]")
4. Escalate after 3 failed attempts

Full agent-facing instructions are in `skill.md` under "When a tool call fails".

## On-Disk Layout

```
longevityOS-data/
  debug/
    trace.jsonl              <-- all layers, append-only
    learnings.jsonl          <-- agent discoveries, append-only
    artifacts/               <-- preserved temp files on failure
      r_7f2a-tc_9x3k.json
      ...
```

`debug/` is gitignored along with the rest of `longevityOS-data/`.
Logs are local-only, no remote sync.

## Design Decisions

**Why one file instead of per-layer files?**
Grep with `runId` gives you the full pipeline in chronological order.
Splitting by layer means you need to open 4 files and mentally merge
by timestamp. One file, one grep.

**Why JSONL instead of structured DB?**
Append-only, no schema migrations, works with grep/jq, survives crashes
(each line is independent), easy to rotate (`mv trace.jsonl trace.jsonl.bak`).

**Why only 3 scripts instrumented?**
The hooks already capture input/output/error/duration for every tool call.
Script-level logging is only added where hooks have blind spots:
external API calls (Whoop, RSS), temp file contents, and multi-step
enrichment pipelines. The other 5 scripts are pure data transforms
where the hook output tells the full story.

**Why not log tool results?**
The `after_tool_call` hook has a `result` field, but tool results can be
large (full nutrition summaries, coach context payloads). Logging them
would bloat the trace file. The `error` field is sufficient — on success,
the result is in the session transcript.

**Why env vars for Python correlation?**
The alternative is CLI args, but that changes the script interface.
Env vars are invisible to the script's argparse layer and can be ignored
by tests that don't set them.
