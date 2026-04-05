# Longevity OS Reference Notes

Reference repo:

- https://github.com/albert-ying/longevity-os

This repo is useful, but it should be treated as a source of patterns rather than a blueprint to copy whole.

## What It Actually Is

`longevity-os` is primarily a multi-agent skill with local Python tooling behind it.

Top-level structure observed from the public repo:

- `SKILL.md`
- `agents/`
- `data/`
- `modeling/`
- `scripts/`
- `dashboard/`

The orchestrator skill classifies user intent and dispatches specialized agents. The Python side handles storage, imports, analytics, and the dashboard.

## The Strong Parts Worth Reusing

### 1. Separation Of Concerns

This is the best idea in the repo.

- prompt files define domain behavior
- Python files perform storage and analytics
- dashboard is read-only against local state

For OpenClaw, that maps cleanly to:

- skills for behavior and orchestration
- local scripts for ingestion and computation
- optional dashboard later if you want one

### 2. Local-First Storage

The repo uses SQLite with WAL, foreign keys, strict local permissions, and localhost-only serving.

Notable details from the repo summary:

- SQLite database with `0600` permissions
- `dashboard/server.py` binds to `127.0.0.1`
- `data/db.py` is a thin explicit SQL wrapper
- migrations, backups, and exports are all first-class operational scripts

This is architecturally strong, even if you choose to start simpler.

### 3. Health Domain Modeling

The schema is organized by domain instead of one giant blob.

Key table groups reported from the repo:

- diet: `diet_entries`, `diet_ingredients`, `recipe_library`
- exercise: `exercise_entries`, `exercise_details`
- body metrics: `body_metrics`, `custom_metric_definitions`
- biomarkers: `biomarkers`
- supplements: `supplements`
- experiments: `trials`, `trial_observations`
- analysis/cache: `insights`, `model_runs`, `model_cache`, `nutrition_cache`

This is a good reminder that if `/insights` becomes serious, flat files will eventually feel cramped.

### 4. Experiment Engine As A First-Class System

This is the most valuable conceptual part of the repo.

From the public README and module notes:

- pattern detection proposes trial candidates
- trial design and safety review are separated
- trial monitoring and causal analysis are explicit subsystems
- experiment results are not just notes; they become structured records

That is directly aligned with your `/insights` idea.

## The Weak Parts Or Gaps

### 1. Important Workflow Logic Lives In Prompts

This is the biggest caution.

The subagent review found that parts of the system are defined more in prompts than in executable code:

- trial phase logic
- trial review loop
- report cadence
- photo ingestion assumptions

That makes the system expressive, but less deterministic and harder to test.

For your project, any workflow that must be reliable should move into code earlier.

### 2. Photo Ingestion Is Not Really Implemented End-To-End

The repo clearly expects food photos, but the reviewed evidence suggests photo ingestion is mostly schema/prompt-level:

- a `photo_path` field exists
- the skill routes photo-only input to diet logging
- a photos directory is created
- a real image parsing pipeline was not found

Project implication:

- do not assume `longevity-os` already solved "food photo -> nutrient extraction"
- use it for orchestration ideas, not for the actual image ingestion implementation

### 3. Apple Health Import Is Stubbed

The subagent review found:

- lab import is implemented and fairly thorough
- Apple Health import exists as a stub

Project implication:

- your Apple Health XML import will need original work
- `longevity-os` is not a shortcut there

### 4. No Real Scheduler Inside The Repo

The repo does not appear to contain a native scheduler subsystem.

Instead, it exposes one-shot commands and expects an external runtime to schedule them.

That is fine for OpenClaw because OpenClaw already has Gateway cron.

Project implication:

- borrow its reporting ideas
- do not borrow its scheduling story
- use OpenClaw cron instead

## Concrete Pieces Worth Copying Conceptually

Not exact code reuse. Concept reuse.

### Diet Logging

Useful ideas from the review:

- recipe-library-first logic
- ingredient decomposition for Chinese dishes
- confidence scoring
- nutrient cache with TTL

For your use case, the main simplification is that you already said AI estimate is acceptable. That means you can skip the full USDA-first lookup path at first.

### Experiments

The repo's best reusable concepts:

- explicit hypothesis
- explicit intervention
- explicit primary and secondary outcomes
- explicit baseline sufficiency checks
- explicit compliance logging
- explicit safety review

You probably do not need the full adversarial multi-agent version immediately, but the structure is good.

### Analytics

The review highlighted `modeling/patterns.py` and `modeling/causal.py` as the serious analytical core:

- lagged correlation scanning
- multiple-comparison correction
- changepoint detection
- interrupted time series
- BSTS / causal analysis

That is too heavy for v1, but it defines the direction if `/insights` grows into a real analysis engine.

## What To Borrow For This Repo

Borrow now:

- modular health-domain boundaries
- local-first storage mindset
- explicit experiment lifecycle
- thin ingestion layer + separate analytics layer

Borrow later:

- stronger analytics
- dashboard
- richer structured trial engine

Do not borrow directly:

- prompt-heavy workflow logic where determinism matters
- assumption that photo ingestion is already solved
- assumption that Apple Health import is production-ready

