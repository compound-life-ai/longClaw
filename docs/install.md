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

1. Start a new OpenClaw session.
2. Verify `/snap`, `/health`, `/news`, and `/insights` are available.
3. Configure the cron templates from the installed `cron/` directory with your Telegram DM chat id.
