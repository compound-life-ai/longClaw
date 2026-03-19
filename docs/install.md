# Installation

This bundle is intended to be installed as a managed OpenClaw bundle under:

- `~/.openclaw/bundles/compound-clawskill`

The installer also registers:

- `~/.openclaw/bundles/compound-clawskill/skills`

inside `skills.load.extraDirs` in:

- `~/.openclaw/openclaw.json`

## Dry Run

Preview what the installer will do:

```bash
python3 scripts/install_bundle.py --dry-run
```

## Install

Install into the default OpenClaw home:

```bash
python3 scripts/install_bundle.py
```

Install into a custom OpenClaw home:

```bash
python3 scripts/install_bundle.py --openclaw-home /path/to/.openclaw
```

Verify the installed bundle:

```bash
python3 scripts/install_bundle.py --verify
```

## What Gets Installed

The installer copies these directories into the managed bundle:

- `skills/`
- `scripts/`
- `cron/`
- `docs/`

It also initializes these runtime directories:

- `longevityOS-data/nutrition/`
- `longevityOS-data/health/`
- `longevityOS-data/insights/`
- `longevityOS-data/news/`

## After Install

Checking `~/.openclaw/openclaw.json` is necessary, but not sufficient.

Verify config:

```bash
python3 - <<'PY'
import json, pathlib
p = pathlib.Path.home()/'.openclaw'/'openclaw.json'
obj = json.loads(p.read_text())
print(obj.get('skills', {}).get('load', {}).get('extraDirs', []))
PY
```

Verify OpenClaw sees the skills as real ready skills:

```bash
openclaw skills info snap
openclaw skills info health
openclaw skills info news
openclaw skills info insights
openclaw skills info daily-coach
```

Expected result:

- each skill shows `Ready`

Then:

1. Start a new OpenClaw session.
2. Verify `/snap`, `/health`, `/news`, and `/insights` are available and usable.
3. If a Telegram command does not appear in the slash picker, try typing it manually first.
4. Configure the cron templates from the installed `cron/` directory with your Telegram DM chat id.

## Fresh Session Required

OpenClaw snapshots skills at session start. After installation, a fresh OpenClaw session is effectively part of the install process.

## Telegram Note

Telegram command visibility and typed command usability are not always the same thing.

- typed `/snap` can work
- while `/snap` may still be missing from the Telegram command picker if the menu is crowded

That does not necessarily mean the install failed.

## Cron Checklist

Before adding cron jobs:

1. Replace `__TELEGRAM_DM_CHAT_ID__` in:
   - `cron/health-brief.example.json`
   - `cron/news-digest.example.json`
   - `cron/daily-health-coach.example.json`
2. Add the jobs:

```bash
openclaw cron add --from-file cron/health-brief.example.json
openclaw cron add --from-file cron/news-digest.example.json
openclaw cron add --from-file cron/daily-health-coach.example.json
```

## Apple Health Import

Apple Health often gives users `export.zip` rather than a raw XML file.

This bundle now supports both:

```bash
python3 scripts/health/import_apple_health.py --input-zip ~/Downloads/export.zip
python3 scripts/health/import_apple_health.py --input-xml /path/to/apple_health_export/export.xml
```

If you prefer manual extraction, extract `apple_health_export/export.xml` from the zip first.

## Real-World Smoke Test

1. Start a fresh OpenClaw session.
2. Run `/news`.
3. Test `/snap` with a food photo.
4. Run `/health`.
5. Run `/insights`.
6. Enable `cron/daily-health-coach.example.json` if you want the personalized daily coaching message.
