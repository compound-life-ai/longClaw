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

    subgraph Tools["Tool Layer (index.ts)"]
        TNutrition["nutrition"]
        THealth["health_profile"]
        TWhoop["whoop_import"]
        TExperiments["experiments"]
        TNews["news_digest"]
        TCoach["coaching_context"]
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

    Photo --> Snap --> TNutrition --> EL --> LK --> NCache
    EL --> Meals

    Whoop --> WhoopAPI
    Health --> TWhoop --> IW --> WhoopAPI
    Health --> THealth --> PS --> Profile
    IW --> Tokens
    QA --> Health

    News --> TNews --> FD --> RSS
    FD --> NewsCache

    CI --> Insights --> TExperiments --> EX
    EX --> Experiments
    EX --> Checkins

    Coach --> TCoach --> DHC
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

![Daily Coach Subagent Dispatch Flow](docs/images/dispatch-flow-diagram.png)

### Showcases

<details>
<summary>🏥 Daily Coach — 10 specialists review your data every morning</summary>
<p align="center">
  <img src="docs/images/telegram-mockup.png" alt="Daily Coach" width="390" />
</p>
</details>

<details>
<summary>🍚 Weekly Nutrition Review — macros, micros, and personalized food suggestions</summary>
<p align="center">
  <img src="docs/images/mockup-nutrition.png" alt="Nutrition Review" width="390" />
</p>
</details>

<details>
<summary>🔍 Pattern Detection — caffeine, sleep, and travel correlations</summary>
<p align="center">
  <img src="docs/images/mockup-patterns.png" alt="Pattern Detection" width="390" />
</p>
</details>

<details>
<summary>🧪 Blood Work Analysis — biomarker trends and optimization advice</summary>
<p align="center">
  <img src="docs/images/mockup-bloodwork.png" alt="Blood Work Analysis" width="390" />
</p>
</details>

<details>
<summary>🌙 Always On — late night chat, empathetic and human</summary>
<p align="center">
  <img src="docs/images/mockup-sleep.png" alt="Late Night Chat" width="390" />
</p>
</details>

## Install / Uninstall

### [Recommended] Have your OpenClaw install this by itself.

** Install the skills and plugins **
```bash
git clone https://github.com/compound-life-ai/longClaw
cd longClaw
openclaw plugins install -l .
```

** Setup the daily cron jobs **

Replace `__TELEGRAM_DM_CHAT_ID__` in the templates, then:

```bash
openclaw cron add --from-file cron/health-brief.example.json
openclaw cron add --from-file cron/news-digest.example.json
openclaw cron add --from-file cron/daily-health-coach.example.json
```

Verify the plugin loaded correctly:

```bash
openclaw plugins doctor
openclaw plugins inspect compound-clawskill
```

Start a **fresh OpenClaw session** after install — skills are snapshotted at session start.

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

### Uninstall

```bash
openclaw plugins uninstall compound-clawskill
```

This removes the plugin registration. The cloned repository and any data in `longevityOS-data/` remain on disk.

To also remove cron jobs:

```bash
openclaw cron remove health-brief
openclaw cron remove news-digest
openclaw cron remove daily-health-coach
```

## Plugin & SDK

This is a native [OpenClaw plugin](https://docs.openclaw.ai/plugins/building-plugins) that registers 6 tools via the [Plugin SDK](https://docs.openclaw.ai/plugins/sdk-overview):

| Tool | Description |
|------|-------------|
| `nutrition` | Log meals, daily totals, weekly summary vs RDA |
| `health_profile` | Merge questionnaire/Whoop data, show profile |
| `whoop_import` | Fetch and normalize Whoop API data |
| `experiments` | Create, check-in, analyze self-experiments |
| `news_digest` | Fetch ranked health/longevity news |
| `coaching_context` | Generate daily coaching context from all data |

Each tool wraps the corresponding Python script in `scripts/` — the SDK entry point (`index.ts`) shells out to them via `execFile`.

Skills in `skills/` provide agent-facing guidance (when to use each tool, how to present results). The tools provide the typed, inspectable interface that OpenClaw registers.

**Relevant OpenClaw docs:**

- [Plugin SDK Overview](https://docs.openclaw.ai/plugins/sdk-overview)
- [Plugin Entry Points](https://docs.openclaw.ai/plugins/sdk-entrypoints)
- [Plugin Manifest](https://docs.openclaw.ai/plugins/manifest)
- [Plugin Architecture](https://docs.openclaw.ai/plugins/architecture)
- [Plugin Setup & Config](https://docs.openclaw.ai/plugins/sdk-setup)
- [Plugin Testing](https://docs.openclaw.ai/plugins/sdk-testing)

## Development

```bash
# Run Python tests
python3 -m unittest discover -s tests -v

# Link plugin for local development
openclaw plugins install -l .
openclaw gateway restart

# Inspect registered tools
openclaw plugins inspect compound-clawskill

# Diagnostics
openclaw plugins doctor
```

Tests use real (sanitized) Whoop API response fixtures from `tests/fixtures/whoop/`.

## Repo Layout

```
index.ts               SDK entry point — registers 6 tools
openclaw.plugin.json   Plugin manifest (skills, config schema)
package.json           Package metadata + openclaw extensions
SKILL.md               Root meta skill (natural language routing)
skills/                OpenClaw-facing skill definitions
agents/                Specialist subagent prompts (10 files)
scripts/               Deterministic Python helpers (called by tools)
cron/                  Example cron job configs
seed/                  Optional fixture data
longevityOS-data/      Runtime data (gitignored)
tests/                 Unit and CLI tests
docs/                  Architecture and design notes
website/               Next.js landing page
```

## Docs

- [docs/install.md](docs/install.md)
- [docs/openclaw-extension-survey.md](docs/openclaw-extension-survey.md)
- [docs/proposed-health-companion-architecture.md](docs/proposed-health-companion-architecture.md)
- [docs/longevity-os-reference-notes.md](docs/longevity-os-reference-notes.md)
- [docs/news-sources.md](docs/news-sources.md)
