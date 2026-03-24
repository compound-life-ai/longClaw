---
name: daily-coach
description: Generate a personalized daily health coaching message by dispatching 10 specialist subagents that each review the user's data from their domain expertise.
user-invocable: false
---

# Daily Coach

Use this skill when:

- a scheduled daily coaching message needs to be generated
- the user explicitly asks for the cron-generated daily health coaching behavior

## Step 1: Gather context

Run:

```bash
python3 "{baseDir}/../../scripts/coach/daily_health_coach.py" \
  --data-root "{baseDir}/../../longevityOS-data"
```

For richer nutrition context, also run:

```bash
python3 "{baseDir}/../../scripts/nutrition/weekly_summary.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  --end-date "YYYY-MM-DD"
```

Collect the JSON outputs. These form the **shared context payload** for all subagents below.

## Step 2: Spawn 10 specialist subagents

Use `sessions_spawn` to spawn each of the following subagents **in parallel**. Pass each one the full context payload from Step 1, and instruct each to produce a **2-3 sentence** recommendation from their specialty.

Each subagent must format its response starting with its role header:

```
[Role Emoji]

suggestion
```

### The 10 Specialists

| # | Role | Emoji | Focus | What to review |
|---|------|-------|-------|----------------|
| 1 | **Imperial Physician** | 🏥 | Orchestrator / overall | Synthesize the big picture: what is the single most important thing to focus on today based on all data |
| 2 | **Diet Physician** | 🍚 | Nutrition | Yesterday's calorie/protein/fiber totals, micronutrient gaps, specific food suggestions |
| 3 | **Movement Master** | 🏃 | Exercise | Whoop strain data, workout frequency, recovery-adjusted training suggestion |
| 4 | **Pulse Reader** | 💓 | Body metrics | Resting HR trend, HRV (RMSSD) trend, SpO2, skin temp — flag anything off-baseline |
| 5 | **Formula Tester** | 🧪 | Biomarkers | Any lab data in profile, cross-reference with diet/exercise patterns |
| 6 | **Herbalist** | 🌿 | Supplements | Micronutrient gaps that food alone won't close, supplement timing considerations |
| 7 | **Trial Monitor** | 📋 | Experiments | Active experiment status, compliance, whether a check-in is needed today |
| 8 | **Court Magistrate** | ⚖️ | Trial design | If patterns are emerging, suggest whether a new N-of-1 trial is warranted |
| 9 | **Medical Censor** | 🛡️ | Safety review | Flag any concerning trends (sleep decline, recovery dropping, overtraining signs) |
| 10 | **Court Scribe** | 📜 | Reports & literature | Pick the single most relevant news item and explain why it matters for this user today |

### Subagent task template

For each subagent, use a task like:

```
You are the {Role} ({Emoji}), a specialist in {Focus}.

Review the following health context for today and provide your recommendation.
Keep it to 2-3 sentences. Be specific, actionable, and grounded in the data provided.
Do not overclaim from sparse data. If data for your domain is missing, say so briefly.

Start your response with:
[{Role} {Emoji}]

CONTEXT:
{paste the JSON context payload here}
```

## Step 3: Assemble the daily message

Once all 10 subagents announce back, assemble the final daily coaching message:

1. Start with today's date and a one-line status summary (e.g. "Recovery 60% · Sleep 7.2h · Strain 10.2")
2. Include each specialist's response in order (Imperial Physician first, Court Scribe last)
3. If `checkin_needed` is true, add an experiment check-in prompt at the end
4. Keep the assembled message clean — do not add extra commentary between specialist responses

Rules:

- Reply in the user's language if it is obvious from stored profile context. Otherwise reply in English.
- Keep recommendations conservative, lifestyle-only, and specific to the user's own data.
- Do not overclaim from sparse data. If a subagent says "insufficient data," keep that response as-is.
- If `insufficient_data` is true from Step 1, skip the subagent dispatch and instead say what is missing and what to log next.
