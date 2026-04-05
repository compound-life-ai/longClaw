# OpenClaw Extension Survey

This is the practical extension map for this project, based on the OpenClaw docs rather than guesswork.

## Recommended Default

For this project, the default stack should be:

- skill for user-facing behavior and slash exposure
- helper scripts for data parsing, storage, and external API calls
- cron jobs for morning summaries and scheduled digests
- optional hook only when you need event-driven behavior before or after the normal agent loop

Do not start with a plugin unless you hit a real boundary that skills + scripts + cron cannot cross.

## Mechanism Comparison

### Skills

Use skills when you want:

- model-visible instructions
- reusable domain behavior
- user-invocable slash commands
- per-run env injection for a specific workflow

Important documented behavior:

- Skills are `SKILL.md` folders, loaded from `<workspace>/skills`, `~/.openclaw/skills`, then bundled skills.
- Workspace skills override managed and bundled skills with the same name.
- `user-invocable: true` exposes the skill as a slash command.
- `command-dispatch: tool` can make a slash command deterministic instead of model-mediated.
- Skills are snapshotted per session and hot-refreshed by the watcher.
- Skill env injection is per agent run, not global.

Relevant docs:

- https://docs.openclaw.ai/tools/skills
- https://docs.openclaw.ai/tools/creating-skills
- https://docs.openclaw.ai/tools/skills-config
- https://docs.openclaw.ai/tools/slash-commands

Non-obvious constraints:

- The docs clearly treat skills as prompt + metadata + env overlays, not as a separate execution runtime.
- `skills.entries.*.env` and `apiKey` apply to host runs. Sandboxed sessions need env configured in sandbox settings instead.
- Skill frontmatter parsing is stricter than normal YAML usage. `metadata` is expected as a single-line JSON object.

### Slash Commands

Use slash commands when you want:

- explicit user intent
- short deterministic entry points
- fast access from Telegram's native command menu

Important documented behavior:

- Commands are handled by the Gateway, not by the model.
- Telegram and Discord support native command registration by default.
- Skill commands are sanitized to `a-z0-9_` with collision suffixes.
- If too many commands exist, Telegram menu registration can fail with `BOT_COMMANDS_TOO_MUCH`.

Relevant docs:

- https://docs.openclaw.ai/tools/slash-commands
- https://docs.openclaw.ai/channels/telegram

Project implication:

- Do not expose every health feature as a separate native Telegram command on day 1.
- A small set like `/snap`, `/health`, `/insights`, `/news` is reasonable.
- For overflow or experimentation, `/skill <name>` is safer than bloating the Telegram menu.

### Scripts

Use scripts when you want:

- parsing
- storage updates
- local analytics
- external API or file import workflows

Important documented behavior:

- Scripts are not a first-class OpenClaw extension type.
- OpenClaw docs treat them as helper files, not as auto-discovered runtime units.

Relevant docs:

- https://docs.openclaw.ai/help/scripts
- https://docs.openclaw.ai/tools/exec

Project implication:

- Scripts are implementation detail behind a skill, not the user-facing integration mechanism.
- This is the right place for Apple Health XML parsing, CSV/JSON writes, article fetching, and experiment bookkeeping.

### Cron Jobs

Use cron when you want:

- scheduled agent turns
- morning summaries
- recurring news digests
- reminder or check-in flows

Important documented behavior:

- Cron is Gateway-native and stored under `~/.openclaw/cron/`.
- Jobs can run in `main`, `isolated`, `current`, or a named custom session.
- Isolated jobs can announce directly to Telegram.
- Cron delivery supports Telegram topic IDs like `-1001234567890:topic:123`.
- Cron has explicit storage, history, retry, and retention behavior.

Relevant docs:

- https://docs.openclaw.ai/automation/cron-jobs
- https://docs.openclaw.ai/automation/cron-vs-heartbeat

Project implication:

- Morning health brief and daily news digest should be isolated cron jobs with Telegram announce delivery.
- Experiment check-in can be part of the same morning job instead of a separate scheduler at first.

### Hooks

Use hooks when you want:

- event-driven behavior inside the Gateway
- message preprocessing or logging
- session lifecycle automation
- bootstrap file mutation

Important documented behavior:

- Hooks live in `<workspace>/hooks` or `~/.openclaw/hooks`.
- A hook is `HOOK.md` + `handler.ts`.
- Hook events include command, message, agent bootstrap, and gateway startup.
- `message:preprocessed` fires after media and link understanding, before the agent sees the final enriched body.

Relevant docs:

- https://docs.openclaw.ai/automation/hooks

Project implication:

- Hooks are optional for this project.
- The first plausible hook would be a lightweight logger or a message preprocessor that tags likely food-photo messages.
- Do not start here unless you have a precise event-driven need.

### Plugins

Use plugins only when you need:

- a real in-process custom tool
- a service or runtime component
- a custom provider or channel
- HTTP routes or broader integration surfaces

Important documented behavior:

- Native plugins are TypeScript modules plus `openclaw.plugin.json`.
- Native plugins can register tools, hooks, commands, services, routes, skills, providers, and channels.
- Compatible bundles can be discovered, but native plugins are the real in-process extension path.

Relevant docs:

- https://docs.openclaw.ai/tools/plugin
- https://docs.openclaw.ai/plugins/building-extensions
- https://docs.openclaw.ai/plugins/manifest

Project implication:

- Apple Health parsing, nutrition logging, experiments, and news do not require a plugin at first.
- A plugin becomes justified if you later want a first-class `health_data_import` tool, a persistent integration service, or strong typed storage/runtime contracts.

## Telegram-Specific Constraints

These matter for your setup because Telegram is the chosen surface.

- Telegram routing is deterministic back to Telegram.
- Group topics are isolated with `:topic:<threadId>` suffixes.
- Native commands are supported, but command-menu size is limited.
- Preview streaming edits a preview message rather than doing token-delta streaming.
- Telegram can receive inbound media and keep topic-aware reply routing.

Relevant docs:

- https://docs.openclaw.ai/channels/telegram

## Media Handling Implications

This is the most important non-obvious part for the food-photo feature.

OpenClaw already has inbound media understanding:

- It can summarize inbound image/audio/video before the agent pipeline runs.
- Original attachments are still passed through even when understanding runs.
- Image understanding can be configured explicitly, or auto-detected from available providers/tools.

Relevant docs:

- https://docs.openclaw.ai/nodes/media-understanding
- https://docs.openclaw.ai/nodes/images

Project implication:

- You do not need a custom Telegram photo transport.
- A food logging skill can rely on OpenClaw's existing inbound media pipeline, then call a local script to store results.
- For your "phone snap -> send" workflow, this is a strong argument for skill-first rather than plugin-first.

## Final Recommendation

Start with:

- 4 skills: `snap`, `health`, `news`, `insights`
- 1 shared scripts directory for ingestion, storage, and analysis
- 1 or 2 cron jobs for morning summary and daily news digest
- no plugin yet
- no hook yet, unless we later want smarter automatic routing for photo-only messages

Only add a plugin if one of these becomes true:

- you need a first-class custom tool instead of model/tool orchestration
- you need a long-running integration service
- you need stronger runtime guarantees than prompt-driven skill behavior can provide

