> **Best experience:** Use the latest frontier model (GPT-5.4, Opus 4.6). This guide assumes a working [OpenClaw](https://docs.openclaw.ai) installation.

# compound-clawskill

OpenClaw skill bundle for a personal health companion.

- `/snap` — meal logging with ingredient-level nutrition enrichment
- `/health` — Whoop data import + structured health profile
- `/news` — curated health/longevity digest
- `/insights` — structured self-experiments with gap-aware recommendations
- `daily-coach` — cron-driven personalized daily coaching via 10 specialist subagents

All skills respond to natural language. Say "had salmon with rice for lunch" instead of `/snap`, or "how did I sleep?" instead of `/health`.

## Architecture

![System Architecture](docs/images/architecture-diagram.png)

```mermaid
flowchart TB
    subgraph User["👤 User Input"]
        Photo["📸 Food Photo / Text"]
        Whoop["⌚ Whoop Strap"]
        QA["📝 Questionnaire"]
        CI["✅ Check-in Data"]
    end

    subgraph Skills["Skill Layer"]
        Snap["/snap"]
        Health["/health"]
        News["/news"]
        Insights["/insights"]
        Coach["daily-coach<br/>(cron 7:10am)"]
    end

    subgraph Scripts["Script Layer"]
        EL["estimate_and_log.py"]
        LK["lookup.py"]
        IW["import_whoop.py"]
        PS["profile_store.py"]
        FD["fetch_digest.py"]
        EX["experiments.py"]
        DHC["daily_health_coach.py"]
    end

    subgraph Data["longevityOS-data/"]
        Meals["nutrition/meals.csv"]
        NCache["nutrition/nutrition_cache.json"]
        Profile["health/profile.json"]
        Tokens["health/whoop_tokens.json"]
        Experiments["insights/experiments.json"]
        Checkins["insights/checkins.json"]
        NewsCache["news/cache.json"]
    end

    subgraph External["External APIs"]
        WhoopAPI["Whoop API v2"]
        RSS["RSS Feeds"]
    end

    Photo --> Snap --> EL --> LK --> NCache
    EL --> Meals

    Whoop --> WhoopAPI
    Health --> IW --> WhoopAPI
    IW --> Tokens
    IW --> PS --> Profile
    QA --> Health --> PS

    News --> FD --> RSS
    FD --> NewsCache

    CI --> Insights --> EX
    EX --> Experiments
    EX --> Checkins

    Coach --> DHC
    DHC --> Meals
    DHC --> Profile
    DHC --> Experiments
    DHC --> Checkins
    DHC --> NewsCache
```

## Whoop Integration

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant O as OAuth Server
    participant W as Whoop API
    participant S as import_whoop.py
    participant P as profile.json

    Note over U,W: One-time OAuth flow
    U->>O: Visit /api/whoop/authorize
    O->>W: Redirect to Whoop login
    W-->>O: Callback with auth code
    O->>W: Exchange code for tokens
    W-->>O: access_token + refresh_token
    O-->>U: "Copy Tokens for CLI"
    U->>S: Paste tokens → whoop_tokens.json

    Note over S,W: Each /health sync
    S->>S: Read whoop_tokens.json
    S->>W: GET /v2/recovery
    W-->>S: score, RHR, HRV, SpO2, skin temp
    S->>W: GET /v2/activity/sleep
    W-->>S: stages, efficiency, respiratory rate
    S->>W: GET /v2/cycle
    W-->>S: strain (0-21), kJ, avg/max HR
    S->>W: GET /v2/activity/workout
    W-->>S: sport, HR zones, distance
    S->>W: GET /v2/user/measurement/body
    W-->>S: height, weight, max HR
    S->>S: Normalize + aggregate
    S->>P: Merge under "whoop" key
```

## Daily Coach — 10 Specialist Subagents

Every morning, the daily coach cron gathers context from all data stores and dispatches 10 specialist subagents in parallel. Each delivers its own Telegram bubble as it completes.

### The Specialists

<table>
<tr>
<td align="center" width="20%"><img src="docs/characters/yuyi.svg" alt="Imperial Physician" width="80"/><br/><b>Imperial Physician</b><br/><sub>Orchestrator — synthesizes #1 priority</sub></td>
<td align="center" width="20%"><img src="docs/characters/shiyi.svg" alt="Diet Physician" width="80"/><br/><b>Diet Physician</b><br/><sub>Nutrition — macros, micros, food suggestions</sub></td>
<td align="center" width="20%"><img src="docs/characters/daoyin.svg" alt="Movement Master" width="80"/><br/><b>Movement Master</b><br/><sub>Exercise — strain-adjusted training</sub></td>
<td align="center" width="20%"><img src="docs/characters/zhenmai.svg" alt="Pulse Reader" width="80"/><br/><b>Pulse Reader</b><br/><sub>Body Metrics — RHR, HRV, SpO₂ trends</sub></td>
<td align="center" width="20%"><img src="docs/characters/yanfang.svg" alt="Formula Tester" width="80"/><br/><b>Formula Tester</b><br/><sub>Biomarkers — cross-domain patterns</sub></td>
</tr>
<tr>
<td align="center" width="20%"><img src="docs/characters/bencao.svg" alt="Herbalist" width="80"/><br/><b>Herbalist</b><br/><sub>Supplements — micronutrient gap analysis</sub></td>
<td align="center" width="20%"><img src="docs/characters/shixiao.svg" alt="Trial Monitor" width="80"/><br/><b>Trial Monitor</b><br/><sub>Experiments — compliance tracking</sub></td>
<td align="center" width="20%"><img src="docs/characters/yuanpan.svg" alt="Court Magistrate" width="80"/><br/><b>Court Magistrate</b><br/><sub>Trial Design — N-of-1 candidates</sub></td>
<td align="center" width="20%"><img src="docs/characters/yizheng.svg" alt="Medical Censor" width="80"/><br/><b>Medical Censor</b><br/><sub>Safety Review — overtraining, decline flags</sub></td>
<td align="center" width="20%"><img src="docs/characters/baogao.svg" alt="Court Scribe" width="80"/><br/><b>Court Scribe</b><br/><sub>Reports — relevant research + literature</sub></td>
</tr>
</table>

### Dispatch Flow

<p align="center">
  <img src="docs/images/dispatch-flow-diagram.png" alt="Daily Coach Subagent Dispatch Flow" width="100%" />
</p>

### Example Output

<p align="center">
  <img src="docs/images/telegram-mockup.png" alt="Daily Coach Telegram Output" width="390" />
</p>

## Install

Tell your OpenClaw agent:

```
Install the compound-clawskill bundle from https://github.com/compound-life-ai/longClaw
```

Start a **fresh OpenClaw session** after install — skills are snapshotted at session start.

<details>
<summary>Manual install</summary>

```bash
git clone https://github.com/compound-life-ai/longClaw
cd longClaw

# preview
python3 scripts/install_bundle.py --dry-run

# install
python3 scripts/install_bundle.py

# verify
python3 scripts/install_bundle.py --verify

# optional: seed sample data
python3 scripts/install_bundle.py --seed-data
```
</details>

<details>
<summary>Full install instructions for an OpenClaw agent</summary>

```text
1. Clone `https://github.com/compound-life-ai/longClaw` to a stable local path.
2. Change into the cloned repository.
3. Run `python3 scripts/install_bundle.py`.
4. Run `python3 scripts/install_bundle.py --verify`.
5. Confirm that `~/.openclaw/openclaw.json` includes the installed bundle `skills/` path inside `skills.load.extraDirs`.
6. Tell the user to start a new OpenClaw session.
7. Tell the user to verify that `/snap`, `/health`, `/news`, and `/insights` are available.
8. If needed, configure cron templates from `cron/` with their Telegram DM chat id.
9. Ask if they'd like to seed sample data: `python3 scripts/install_bundle.py --seed-data`.
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

For the 10-subagent daily coach, add to `~/.openclaw/openclaw.json`:

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxChildrenPerAgent: 10,
        maxConcurrent: 10,
      },
    },
  },
}
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
agents/             Specialist subagent prompts (10 files)
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
