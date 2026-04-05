# Cron Setup

These jobs assume:

- Isolated cron sessions
- Telegram DM delivery
- Separate morning health, news, and daily coach messages

Replace `<CHAT_ID>` with your Telegram DM chat ID, then create the jobs:

```bash
openclaw cron add --name "Health Morning Brief" --cron "0 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the health and insights skills to create today's morning brief. Summarize yesterday's nutrition totals, the latest Apple Health sleep/activity context, 1-2 lifestyle recommendations, and include the active experiment check-in if relevant. Reply in the user's language and keep it compact."
openclaw cron add --name "Health News Digest" --cron "5 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the news skill to fetch today's curated digest. Summarize only the highest-signal items for nutrition, sleep, exercise, aging, and self-experimentation. Keep the message concise and mention the source for each item."
openclaw cron add --name "Daily Health Coach" --cron "10 7 * * *" --tz "America/Los_Angeles" --session isolated --light-context --announce --best-effort-deliver --channel telegram --to "<CHAT_ID>" --message "Use the daily-coach skill to generate today's personalized health coaching message. Keep it compact, conservative, and grounded in local health, nutrition, experiment, and cached-news context."
```

Schedule:

| Job | Cron | Time |
|-----|------|------|
| Health Morning Brief | `0 7 * * *` | 7:00 AM |
| Health News Digest | `5 7 * * *` | 7:05 AM |
| Daily Health Coach | `10 7 * * *` | 7:10 AM |

Verify with `openclaw cron list`. Remove with `openclaw cron remove <job-id>`.
