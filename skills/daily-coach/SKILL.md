---
name: daily-coach
description: Generate a personalized daily health coaching message by dispatching 10 specialist subagents that each review the user's data from their domain expertise. Each subagent delivers its own message as a separate Telegram bubble.
user-invocable: false
---

# Daily Coach

Use this skill when:

- a scheduled daily coaching message needs to be generated
- the user explicitly asks for the cron-generated daily health coaching behavior

## Step 1: Gather context

Run both scripts to build the shared context payload:

```bash
python3 "{baseDir}/../../scripts/coach/daily_health_coach.py" \
  --data-root "{baseDir}/../../longevityOS-data"
```

```bash
python3 "{baseDir}/../../scripts/nutrition/weekly_summary.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  --end-date "YYYY-MM-DD"
```

If `insufficient_data` is true: skip subagent dispatch. Instead say what is missing and what to log next.

## Step 2: Dispatch 10 specialist subagents

Read each agent prompt file from `{baseDir}/../../agents/` and spawn all 10 in parallel using `sessions_spawn`.

### Agent Registry

| # | File | Role | Emoji |
|---|------|------|-------|
| 1 | `imperial-physician.md` | Orchestrator — #1 priority for today | 🏥 |
| 2 | `diet-physician.md` | Nutrition — meals, macros, micros | 🍚 |
| 3 | `movement-master.md` | Exercise — strain, training load | 🏃 |
| 4 | `pulse-reader.md` | Body metrics — RHR, HRV, SpO2 | 💓 |
| 5 | `formula-tester.md` | Cross-domain pattern detection | 🧪 |
| 6 | `herbalist.md` | Supplement considerations | 🌿 |
| 7 | `trial-monitor.md` | Experiment status + compliance | 📋 |
| 8 | `court-magistrate.md` | Trial design candidates | ⚖️ |
| 9 | `medical-censor.md` | Safety flags + warnings | 🛡️ |
| 10 | `court-scribe.md` | Relevant news + literature | 📜 |

### Dispatch protocol

For each agent in the registry:

1. Read the agent prompt: `read("{baseDir}/../../agents/{file}")`
2. Construct the task:

```
{contents of the agent .md file}

---

TODAY'S CONTEXT:
{paste the full JSON context payload from Step 1}

WEEKLY NUTRITION:
{paste the weekly summary JSON from Step 1}
```

3. Spawn: `sessions_spawn(task=<constructed task>, label=<role name>)`

Spawn ALL 10 in parallel. Each subagent runs independently and announces its result back as a separate message.

## Step 3: No assembly needed

Each subagent announces directly to the chat channel as a separate Telegram bubble. They arrive as each finishes. The main agent does NOT need to collect or reformat the results.

After all 10 have announced, if `checkin_needed` is true, send one final message prompting the user to log their experiment check-in.

## Rules

- Reply in the user's language if obvious from profile context. Otherwise English.
- Each subagent produces 2-3 sentences starting with `[Role Emoji]`.
- Recommendations must be conservative, lifestyle-only, grounded in the user's own data.
- Do not overclaim from sparse data. Agents should say "insufficient data" when appropriate.
- Subagents should NOT repeat each other's recommendations — each owns their domain.

## OpenClaw config requirements

The install script (step 6) configures `agents.defaults.subagents.maxChildrenPerAgent` and `maxConcurrent` to 10 in `~/.openclaw/openclaw.json`. Without this, only 5 of the 10 specialists will spawn.
