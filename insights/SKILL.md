---
name: insights
description: Discover patterns in health data, answer questions about correlations, and guide structured self-experiments with observation, hypothesis, check-ins, analysis, and next-step recommendations.
user-invocable: true
---

# Insights

Use this skill when:

- the user asks about patterns, correlations, or trends in their health data (e.g. "why am I sleeping poorly?", "what's affecting my HRV?", "summarize my recent patterns")
- the user wants a hypothesis, experiment, or analysis of recent health data
- the user invokes `/insights` (legacy shortcut)

Pattern discovery mode:

When the user asks about patterns or correlations, **proactively analyze all available local data** (Apple Health metrics, nutrition logs, experiment check-ins) to find correlations. Do not ask the user to manually report confounders — infer them from the data. Present findings as specific, data-backed observations, for example:

- "Past 2 weeks: 4 nights with deep sleep < 1hr — 3 of those had caffeine intake after 15:00"
- "Wed and Fri HRV notably low — both days had 10hr+ screen time"
- "Late eating (after 21:00) correlates with resting HR +5bpm average"

This proactive pattern discovery from data is a core differentiator. The agent should look smart — it sees correlations the user would never manually track.

Experiment mode:

Rules:

- Reply in the user's language.
- Follow structured phases: observation, hypothesis, experiment design, active trial, check-in, analysis, next step.
- Keep recommendations lifestyle-only.
- If data is insufficient, do not improvise a strong recommendation. Run a gap analysis and ask for the missing data.

Start every `/insights` session by calling the `experiments` tool:

```json
{ "command": "gap_report" }
```

If the user wants to start an experiment:

1. Build the experiment payload with `title`, `domain`, `hypothesis`, `null_hypothesis`, `intervention`, `primary_outcome`, and optional `secondary_outcomes`, windows, and questions.
2. Call the `experiments` tool:

```json
{
  "command": "create",
  "input_json": {
    "title": "...",
    "domain": "...",
    "hypothesis": "...",
    "null_hypothesis": "...",
    "intervention": "...",
    "primary_outcome": "..."
  }
}
```

For a daily check-in:

1. Capture compliance, 1 to 2 primary outcome scores, confounders, and a short note.
2. Call the `experiments` tool:

```json
{
  "command": "checkin",
  "input_json": {
    "experiment_id": "<id>",
    "compliance": 0.9,
    "primary_outcome_scores": { "metric": 7 },
    "confounders": [],
    "note": "..."
  }
}
```

For experiment review, call the `experiments` tool:

```json
{ "command": "analyze", "experiment_id": "<id>" }
```

When the script says more data is needed:

- explain exactly what is missing
- ask the user to collect that data
- tell them to return to `/insights` after enough data exists
