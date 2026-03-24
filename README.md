> **Best experience:** Use the latest frontier model (GPT-5.4, Opus 4.6). This guide assumes a working [OpenClaw](https://docs.openclaw.ai) installation.

# compound-clawskill

OpenClaw skill bundle for a personal health companion.

- `/snap` — meal logging with ingredient-level nutrition enrichment
- `/health` — Whoop data import + structured health profile
- `/news` — curated health/longevity digest
- `/insights` — structured self-experiments with gap-aware recommendations
- `daily-coach` — cron-driven personalized daily coaching

All skills respond to natural language. Say "had salmon with rice for lunch" instead of `/snap`, or "how did I sleep?" instead of `/health`.

## Architecture

```
 User (in OpenClaw)
  │
  ├─ "/snap" or meal photo ──────> estimate_and_log.py ──> meals.csv
  │                                  └─ lookup.py ──> nutrition_cache.json
  │
  ├─ "/health" ──────────────────> import_whoop.py ───┐
  │   (Whoop connect or sync)        (token refresh)  │
  │                                                    │
  │   Whoop API v2 endpoints:                          │
  │   ├─ /v2/recovery ─── recovery score, resting HR,  │
  │   │                    HRV (RMSSD), SpO2, skin temp│
  │   ├─ /v2/activity/sleep ── stage breakdown (light, │
  │   │                    deep/SWS, REM, awake),      │
  │   │                    efficiency, performance,    │
  │   │                    consistency, respiratory    │
  │   │                    rate, disturbances          │
  │   ├─ /v2/cycle ─────── day strain (0-21), kJ,     │
  │   │                    avg/max heart rate          │
  │   ├─ /v2/activity/workout ── sport type, strain,   │
  │   │                    HR zones, distance, duration│
  │   └─ /v2/user/measurement/body ── height, weight,  │
  │                        max heart rate              │
  │                                                    ▼
  ├─ questionnaire answers ──────> profile_store.py ──> profile.json
  │
  ├─ "/news" ────────────────────> fetch_digest.py ──> cache.json
  │                                  └─ RSS feeds
  │
  ├─ "/insights" ────────────────> experiments.py ───> experiments.json
  │   (check-ins, analysis)                            checkins.json
  │
  └─ daily-coach (cron) ────────> daily_health_coach.py
                                    │  reads all stores:
                                    ├─ profile.json (whoop data)
                                    ├─ meals.csv
                                    ├─ experiments.json
                                    └─ cache.json
                                    │
                                    ▼
                              focus areas + actions
                              → Telegram / CLI
```

## Whoop Integration

```
 One-time auth                              Each /health sync
 ──────────────                              ───────────────

 Browser                                     import_whoop.py
   │                                           │
   │  whoop-oauth-five.vercel.app              │ read whoop_tokens.json
   │  /api/whoop/authorize                     │ refresh if expired
   │         │                                 │
   │         ▼                                 ├─ GET /v2/recovery
   │  Whoop login → callback → tokens         ├─ GET /v2/activity/sleep
   │         │                                 ├─ GET /v2/cycle
   │  "Copy Tokens for CLI"                    ├─ GET /v2/activity/workout
   │         │                                 └─ GET /v2/user/measurement/body
   │         ▼                                     │
   │  paste into OpenClaw                          ▼
   │         │                                 normalize + aggregate
   │         ▼                                     │
   │  whoop_tokens.json                            ▼
   │  (longevityOS-data/health/)               profile.json (under "whoop" key)
```

The Whoop profile feeds into the daily coach:

```
 profile.json                 daily-coach reads
 ┌──────────────────────┐     ┌────────────────────────────────────┐
 │ whoop:               │     │ whoop.recovery.recovery_score_avg  │
 │   recovery:          │────>│ whoop.sleep.daily_sleep_hours_avg  │
 │     score, HRV, RHR  │     │ whoop.strain.day_strain_avg        │
 │   sleep:             │     │                                    │
 │     hours, stages    │     │ → focus areas:                     │
 │   strain:            │     │   "sleep consistency"              │
 │     day strain, kJ   │     │   "recovery attention"             │
 │   workouts:          │     │   "experiment checkin"             │
 │     by sport         │     │                                    │
 │   body:              │     │ → suggested actions:               │
 │     height, weight   │     │   "Protect sleep timing tonight…"  │
 └──────────────────────┘     └────────────────────────────────────┘
```

## Install

```bash
# preview
python3 scripts/install_bundle.py --dry-run

# install
python3 scripts/install_bundle.py

# verify
python3 scripts/install_bundle.py --verify

# optional: seed sample data
cp -r seed/* longevityOS-data/
```

Start a **fresh OpenClaw session** after install — skills are snapshotted at session start.

<details>
<summary>Copy-paste install instructions for an OpenClaw agent</summary>

```text
1. Clone `https://github.com/compound-life-ai/longClaw` to a stable local path.
2. Change into the cloned repository.
3. Run `python3 scripts/install_bundle.py`.
4. Run `python3 scripts/install_bundle.py --verify`.
5. Confirm that `~/.openclaw/openclaw.json` includes the installed bundle `skills/` path inside `skills.load.extraDirs`.
6. Tell the user to start a new OpenClaw session.
7. Tell the user to verify that `/snap`, `/health`, `/news`, and `/insights` are available.
8. If needed, configure cron templates from `cron/` with their Telegram DM chat id.
9. Ask if they'd like to seed sample data: `cp -r seed/* longevityOS-data/`.
```
</details>

<details>
<summary>Copy-paste uninstall instructions for an OpenClaw agent</summary>

```text
1. Remove any cron jobs referencing `health-brief`, `news-digest`, or `daily-health-coach`.
2. Remove the bundle's `skills/` path from `skills.load.extraDirs` in `~/.openclaw/openclaw.json`.
3. Delete `~/.openclaw/bundles/compound-clawskill`.
4. Start a new OpenClaw session.
```
</details>

## Cron Setup

Replace `__TELEGRAM_DM_CHAT_ID__` in the templates, then:

```bash
openclaw cron add --from-file cron/health-brief.example.json
openclaw cron add --from-file cron/news-digest.example.json
openclaw cron add --from-file cron/daily-health-coach.example.json
```

## Development

```bash
python3 -m unittest discover -s tests -v
```

Tests use real (sanitized) Whoop API response fixtures from `tests/fixtures/whoop/`.

## Repo Layout

```
skill.md            Root meta skill index (natural language routing)
skills/             OpenClaw-facing skill definitions
scripts/            Deterministic Python helpers
cron/               Example cron job configs
seed/               Optional fixture data
longevityOS-data/   Runtime data (gitignored)
tests/              Unit and CLI tests
docs/               Architecture and design notes
website/            Next.js landing page
```

## Docs

- [docs/install.md](docs/install.md)
- [docs/openclaw-extension-survey.md](docs/openclaw-extension-survey.md)
- [docs/proposed-health-companion-architecture.md](docs/proposed-health-companion-architecture.md)
- [docs/longevity-os-reference-notes.md](docs/longevity-os-reference-notes.md)
- [docs/news-sources.md](docs/news-sources.md)
