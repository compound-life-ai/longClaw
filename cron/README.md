# Cron Setup

These templates assume:

- isolated cron jobs
- Telegram DM delivery
- separate morning health, news, and daily coach messages

Replace `__TELEGRAM_DM_CHAT_ID__` in the example JSON files, then create the jobs with `openclaw cron add`.

Example:

```bash
openclaw cron add --from-file /path/to/compound-clawskill/cron/health-brief.example.json
openclaw cron add --from-file /path/to/compound-clawskill/cron/news-digest.example.json
openclaw cron add --from-file /path/to/compound-clawskill/cron/daily-health-coach.example.json
```

Suggested order:

- `health-brief.example.json` at `0 7 * * *`
- `news-digest.example.json` at `5 7 * * *`
- `daily-health-coach.example.json` at `10 7 * * *`

If your OpenClaw version does not support `--from-file`, copy the JSON shape into the cron tool call or use the equivalent CLI flags from the official docs.
