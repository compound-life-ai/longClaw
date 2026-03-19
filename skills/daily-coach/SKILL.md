---
name: daily-coach
description: Generate a compact, personalized daily health coaching message for the cron workflow using local nutrition, health, experiment, and curated news context.
user-invocable: false
---

# Daily Coach

Use this skill when:

- a scheduled daily coaching message needs to be generated
- the user explicitly asks for the cron-generated daily health coaching behavior

Rules:

- Reply in the user's language if it is obvious from stored profile context or the current session. Otherwise reply in English.
- Keep recommendations conservative, lifestyle-only, and specific to the user's own data.
- Do not overclaim from sparse data.
- Use news only when it is clearly relevant to the active experiment, recent health gaps, or the current focus areas.
- Keep the message compact.

Run:

```bash
python3 "{baseDir}/../../scripts/coach/daily_health_coach.py" \
  --data-root "{baseDir}/../../longevityOS-data"
```

Then produce a hybrid daily coaching message with:

- a short recap of what matters most today (sleep duration, HRV trend, RHR, yesterday's calorie/protein totals)
- specific micronutrient gaps from recent days with food suggestions (e.g. "zinc low — try pumpkin seeds or beef today")
- 1 to 3 prioritized actions
- an experiment check-in prompt only if `checkin_needed` is true
- at most 1 directly relevant news-derived note

For richer nutrition context, also run the weekly summary:

```bash
python3 "{baseDir}/../../scripts/nutrition/weekly_summary.py" \
  --data-root "{baseDir}/../../longevityOS-data" \
  --end-date "YYYY-MM-DD"
```

Use the gaps list to make specific, actionable food suggestions.

If `insufficient_data` is true:

- say what is missing
- give a low-risk fallback action
- explain what the user should log or import next
