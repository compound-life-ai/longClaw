# Installation

This bundle is an OpenClaw native plugin. Install it by linking the cloned repository:

```bash
git clone https://github.com/compound-life-ai/Turri
cd Turri
npm install
openclaw plugins install -l .
```

## Verify

```bash
openclaw plugins doctor
openclaw plugins inspect compound-clawskill
```

If `openclaw plugins doctor` warns that `plugins.allow is empty`, that is a separate trust warning for non-bundled plugins. It does not indicate an installation failure.

Verify OpenClaw sees the skills:

```bash
openclaw skills info snap
openclaw skills info health
openclaw skills info news
openclaw skills info insights
openclaw skills info daily-coach
```

Expected result:

- each skill shows `Ready`

## After Install

1. Start a new OpenClaw session.
2. Verify `/snap`, `/health`, `/news`, and `/insights` are available and usable.
3. If a Telegram command does not appear in the slash picker, try typing it manually first.
4. On first use, the agent will offer to load sample data if the data directories are empty.
5. Configure the cron templates from `bin/cron/` with your Telegram DM chat id and local timezone.

## Fresh Session Required

OpenClaw snapshots skills at session start. After installation, a fresh OpenClaw session is effectively part of the install process.

## Telegram Note

Telegram command visibility and typed command usability are not always the same thing.

- typed `/snap` can work
- while `/snap` may still be missing from the Telegram command picker if the menu is crowded

That does not necessarily mean the install failed.

## Cron Checklist

Replace `<CHAT_ID>` with your Telegram DM chat ID, then add the jobs:

```bash
openclaw cron add --name "Health Morning Brief" --cron "0 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the health and insights skills to create today's morning brief. Summarize yesterday's nutrition totals, the latest Apple Health sleep/activity context, 1-2 lifestyle recommendations, and include the active experiment check-in if relevant. Reply in the user's language and keep it compact."
openclaw cron add --name "Health News Digest" --cron "5 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the news skill to fetch today's curated digest. Summarize only the highest-signal items for nutrition, sleep, exercise, aging, and self-experimentation. Keep the message concise and mention the source for each item."
openclaw cron add --name "Daily Health Coach" --cron "10 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the daily-coach skill to generate today's personalized health coaching message. Keep it compact, conservative, and grounded in local health, nutrition, experiment, and cached-news context."
```

Verify with `openclaw cron list`.

## Apple Health Import

Apple Health often gives users `export.zip` rather than a raw XML file.

This bundle now supports both:

```bash
python3 bin/health/import_apple_health.py --input-zip ~/Downloads/export.zip
python3 bin/health/import_apple_health.py --input-xml /path/to/apple_health_export/export.xml
```

If you prefer manual extraction, extract `apple_health_export/export.xml` from the zip first.

## Real-World Smoke Test

1. Start a fresh OpenClaw session.
2. Run `/news`.
3. Test `/snap` with a food photo.
4. Run `/health`.
5. Run `/insights`.
6. Enable `bin/cron/daily-health-coach.example.json` if you want the personalized daily coaching message.

## Uninstall

```bash
openclaw plugins uninstall compound-clawskill
```

This removes the plugin registration. The cloned repository and data remain on disk.
