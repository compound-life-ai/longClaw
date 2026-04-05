# Proposed Health Companion Architecture

This is the first concrete design for your OpenClaw integration, using the documented OpenClaw mechanisms and the earlier interview answers.

## Project Goal

Build an OpenClaw-based personal health companion that supports:

1. 拍照 -> food logging with calories and micronutrient estimate
2. richer health recommendations from personal data
3. morning cron summary and tips
4. curated health/longevity news digest
5. `/insights` for structured self-experimentation and forward-looking analysis

## Core Design Choice

Start as a skill bundle, not as a plugin.

Recommended composition:

- skills for user-facing workflows
- local scripts for parsing, storage, and analysis
- OpenClaw cron for scheduled outputs
- optional hook later for message preprocessing

Why:

- it matches what OpenClaw documents well today
- it is compatible with your Telegram workflow
- it keeps implementation small enough to ship incrementally
- it avoids premature TypeScript plugin work when the logic is mostly domain orchestration

## Proposed Repo Shape

```text
docs/
top-level 
  snap/
    SKILL.md
  health/
    SKILL.md
  news/
    SKILL.md
  insights/
    SKILL.md
bin/
  nutrition/
    estimate_and_log.py
    csv_store.py
  health/
    import_apple_health.py
    profile_store.py
  news/
    fetch_digest.py
  insights/
    experiments.py
    analyze.py
longevityOS-data/
  nutrition/
    meals.csv
  health/
    profile.json
    imports/
  insights/
    experiments.json
    checkins.json
  news/
    cache.json
```

This keeps the public behavior in `top-level ` and the operational logic in `bin/`.

## Feature Mapping

### 1. Food Photo Logging

Recommended mechanism:

- skill + script
- optional slash command exposure
- natural-language/photo-first behavior should also work without the slash command

Why:

- OpenClaw already supports inbound media understanding
- Telegram already carries the photo payload
- your desired UX is photo-first, not command-first

Recommended behavior:

- if a user sends a food photo, the agent treats it as meal logging unless context strongly suggests otherwise
- the skill asks the model to identify foods, portions, and likely meal type
- the script writes a row to `longevityOS-data/nutrition/meals.csv`
- response is brief: confirmation, estimate, and today's running summary

Suggested CSV columns:

- `timestamp`
- `meal_type`
- `source`
- `foods_json`
- `calories_kcal`
- `protein_g`
- `carbs_g`
- `fat_g`
- `fiber_g`
- `micronutrients_json`
- `confidence`
- `notes`
- `photo_ref`

Important design choice:

- because you said AI estimate is fine, start with model-only estimation
- do not start with USDA/OpenFoodFacts lookup unless accuracy becomes a problem

Optional command:

- `/snap`

But this should be a convenience path, not the only path.

### 2. Health Recommendation Intake

Recommended mechanism:

- `health` skill + import scripts

Supported inputs in v1:

- Apple Health XML export
- manual questionnaire answers
- uploaded lab report summaries or structured extraction results

Deferred integrations:

- Whoop
- Oura
- direct HealthKit sync

Reason:

- you currently have Apple Watch, not Whoop
- manual XML export is acceptable
- direct HealthKit integration is not the cheapest path

Recommended stored shape:

- `longevityOS-data/health/profile.json`
- `longevityOS-data/health/imports/` for raw import artifacts

Profile sections:

- identity and goals
- baseline health context
- wearable summaries
- sleep summaries
- activity summaries
- biomarker history
- active constraints
- recommendation preferences

### 3. Morning Cron

Recommended mechanism:

- isolated OpenClaw cron job with Telegram announce delivery

What it should do each morning:

- summarize yesterday's meals and key nutrition gaps
- summarize latest sleep/activity signals from imported health data
- surface one or two high-signal recommendations
- include experiment check-in when an experiment is active

Recommended cron shape:

- isolated session
- Telegram delivery
- scheduled in your local timezone
- custom named session only if you later want persistent longitudinal cron context

Why isolated first:

- keeps scheduled chatter out of the main thread context
- easier to reason about failures and retries
- matches OpenClaw's documented direct delivery model

### 4. News Digest

Recommended mechanism:

- `news` skill + news fetch script + daily cron

Scope:

- curated daily digest, not an open-ended search assistant

Recommended behavior:

- fetch from a small verified source list
- normalize headlines and summaries into local cache
- deduplicate by URL/title
- score for relevance to your tracked interests: nutrition, sleep, exercise performance, aging, trials, biomarkers
- send a compact daily digest

Storage:

- `longevityOS-data/news/cache.json`

Do not build:

- a generic scraper for the whole web
- full-text archiving for every article

### 5. `/insights`

Recommended mechanism:

- `insights` skill + structured experiment scripts

This is the most important feature to design cleanly.

The skill should operate on structured phases:

1. observation
2. hypothesis
3. experiment design
4. active trial
5. check-in / compliance logging
6. analysis
7. decision / next step

Minimal v1 data model:

- experiments list
- active experiment
- daily check-ins
- linked metrics
- linked nutrition windows
- linked sleep/exercise windows
- recommendations history

Suggested JSON files:

- `longevityOS-data/insights/experiments.json`
- `longevityOS-data/insights/checkins.json`

Each experiment should track:

- `id`
- `title`
- `domain`
- `hypothesis`
- `null_hypothesis`
- `intervention`
- `primary_outcome`
- `secondary_outcomes`
- `baseline_window`
- `intervention_window`
- `checkin_questions`
- `status`
- `created_at`
- `started_at`
- `ended_at`
- `analysis_summary`
- `next_action`

Important simplification:

- do not start with causal modeling
- start with structured logging + simple comparative summaries
- keep the system useful from day 1, then add stronger analysis later

## Skills To Create

### `snap`

Purpose:

- meal logging from image or text

Invocation model:

- implicit for food-photo messages
- explicit via `/snap` when the user wants to force it

### `health`

Purpose:

- build and update the user's health profile
- import Apple Health exports
- accept user questionnaire answers
- combine data into recommendation context

### `news`

Purpose:

- fetch and summarize curated daily health/longevity sources

### `insights`

Purpose:

- generate hypotheses
- propose structured experiments
- manage active trials
- analyze results and recommend next steps

## Storage Recommendation

You previously said:

- CSV for nutrition
- JSON for the rest

That is workable for v1, but there is one real caveat:

- `/insights` is the feature most likely to push you toward queryable storage sooner than the other features

Practical recommendation:

- keep `longevityOS-data/nutrition/meals.csv` for fast local logging and easy inspection
- keep `profile.json`, `experiments.json`, and `checkins.json` for v1
- write the scripts so storage access is behind thin read/write helpers
- if analysis starts requiring joins across meals, sleep, workouts, and experiment windows, migrate only the analysis-facing layer to SQLite instead of rewriting the whole project at once

This keeps the first version simple without pretending flat files will scale forever.

## Non-Obvious Architectural Notes

### Implicit vs Explicit Food Logging

Your desired UX is "phone snap -> send", which argues for implicit meal logging.

But implicit logging has one failure mode:

- not every photo sent to Telegram is a meal photo

So the right v1 policy is:

- implicit logging when confidence is high
- short confirmation question when confidence is low
- `/snap` as the explicit override

That gives you the fast path without making the system annoying or brittle.

### Why Hooks Are Deferred

It is tempting to use a hook to auto-route food photos before the agent loop.

Do not do that first.

Reason:

- the logic is still product logic, not infrastructure logic
- you have not yet settled the confidence threshold or confirmation behavior
- a skill is easier to iterate than a hook when behavior is still changing

Use a hook later only if you want deterministic preprocessing before the model sees the message.

### When A Plugin Becomes Justified

You do not need one now.

A plugin becomes justified if you later need one of these:

- a typed first-class tool for structured health import
- a long-running integration worker
- a reusable runtime service shared across multiple skills
- stronger guarantees than prompt-driven orchestration can provide

Until then, skills + scripts are the cheaper and better-documented path.

## Lowest-Risk Build Order

Build in this order:

1. `snap` skill with image/text meal logging and CSV persistence
2. nutrition running-summary logic
3. `health` skill with Apple Health XML import and normalized profile JSON
4. morning cron with Telegram delivery and experiment check-in
5. `news` skill plus source fetch/cache logic
6. `insights` structured experiment lifecycle

Why this order:

- it gives visible value from day 1
- it uses the simplest documented OpenClaw primitives first
- it postpones the most ambiguous product logic until you already have real user data

## Main Remaining Decisions

Before implementation starts, the most important unresolved questions are:

1. photo-only messages: always log vs log-with-confirmation-on-low-confidence
2. nutrition storage: meal-centric vs ingredient-centric rows
3. morning delivery: single combined digest vs separate health/news sends
4. experiment rigor: exploratory from day 1 vs minimum evidence gate

These are product-shaping decisions, not just engineering preferences.

- `/insights` will want cross-domain joins sooner than the other features

Practical recommendation:

- keep meals in CSV because append-only logging is simple
- keep profile, experiments, and news cache in JSON for v1
- design the scripts so they can later swap to SQLite without changing the skill contract

If the project reaches any of these points, migrate to SQLite:

- multiple experiment types with historical analysis
- frequent cross-domain queries
- dashboarding
- confidence scoring with joins across food, sleep, exercise, and biomarkers

## What Not To Build First

- full plugin runtime
- full dashboard
- Whoop integration
- direct HealthKit sync
- advanced causal inference
- automatic image EXIF stripping pipeline unless it becomes a real requirement

## Lowest-Risk First Milestone

If you want the safest v1 path, build in this order:

1. `snap` skill
2. CSV meal logger script
3. `health` skill with Apple Health XML import
4. morning cron summary
5. `news` skill and digest
6. `insights` structured experiment tracker

That order matches your desired daily usage and avoids starting with the heaviest feature.
