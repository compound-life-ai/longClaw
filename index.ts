import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { execFile } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

function run(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

async function withTempJson(data: unknown, fn: (path: string) => Promise<string>): Promise<string> {
  const path = join(tmpdir(), `longclaw-${randomUUID()}.json`);
  await writeFile(path, JSON.stringify(data));
  try {
    return await fn(path);
  } finally {
    await unlink(path).catch(() => {});
  }
}

export default definePluginEntry({
  id: "compound-clawskill",
  name: "LongClaw",
  description:
    "Personal health companion with meal logging, Whoop integration, self-experiments, and daily coaching",

  register(api) {
    const root = api.resolvePath(".");
    const dataRoot = api.resolvePath("longevityOS-data");
    const py = "python3";

    // ── nutrition ──────────────────────────────────────────────
    api.registerTool({
      name: "nutrition",
      description:
        "Log meals, get daily nutrition totals, or get weekly summary vs RDA targets",
      parameters: Type.Object({
        command: Type.Union([
          Type.Literal("log"),
          Type.Literal("daily_summary"),
          Type.Literal("weekly_summary"),
        ]),
        input_json: Type.Optional(
          Type.Object({}, { additionalProperties: true, description: "Meal payload for 'log' command" }),
        ),
        date: Type.Optional(Type.String({ description: "ISO date for daily_summary (YYYY-MM-DD)" })),
        end_date: Type.Optional(Type.String({ description: "End date for weekly_summary (YYYY-MM-DD)" })),
        days: Type.Optional(Type.Number({ description: "Number of days for weekly_summary", default: 7 })),
        rda_profile: Type.Optional(
          Type.String({ description: "RDA profile: default, male_19_50, female_19_50", default: "default" }),
        ),
      }),
      async execute(_id, params) {
        let stdout: string;
        switch (params.command) {
          case "log":
            stdout = await withTempJson(params.input_json, (path) =>
              run(py, [join(root, "scripts/nutrition/estimate_and_log.py"), "--data-root", dataRoot, "log", "--input-json", path], root),
            );
            break;
          case "daily_summary":
            stdout = await run(py, [
              join(root, "scripts/nutrition/daily_summary.py"),
              "--data-root", dataRoot,
              "--date", params.date!,
            ], root);
            break;
          case "weekly_summary":
            stdout = await run(py, [
              join(root, "scripts/nutrition/weekly_summary.py"),
              "--data-root", dataRoot,
              "--end-date", params.end_date!,
              "--days", String(params.days ?? 7),
              "--rda-profile", params.rda_profile ?? "default",
            ], root);
            break;
        }
        return { content: [{ type: "text", text: stdout! }] };
      },
    });

    // ── health_profile ────────────────────────────────────────
    api.registerTool({
      name: "health_profile",
      description:
        "Manage health profile: merge questionnaire answers, merge Whoop import, or show current profile",
      parameters: Type.Object({
        command: Type.Union([
          Type.Literal("merge_questionnaire"),
          Type.Literal("merge_import"),
          Type.Literal("show"),
        ]),
        input_json: Type.Optional(
          Type.Object({}, { additionalProperties: true, description: "Payload for merge commands" }),
        ),
      }),
      async execute(_id, params) {
        const script = join(root, "scripts/health/profile_store.py");
        const subcmd = params.command === "merge_questionnaire"
          ? "merge-questionnaire"
          : params.command === "merge_import"
            ? "merge-import"
            : "show";

        let stdout: string;
        if (subcmd === "show") {
          stdout = await run(py, [script, "--data-root", dataRoot, "show"], root);
        } else {
          stdout = await withTempJson(params.input_json, (path) =>
            run(py, [script, "--data-root", dataRoot, subcmd, "--input-json", path], root),
          );
        }
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── whoop_import ──────────────────────────────────────────
    api.registerTool({
      name: "whoop_import",
      description: "Fetch latest data from Whoop API and normalize into health profile format",
      parameters: Type.Object({}),
      async execute() {
        const tokenFile = join(dataRoot, "health/whoop_tokens.json");
        const stdout = await run(py, [
          join(root, "scripts/health/import_whoop.py"),
          "--token-file", tokenFile,
        ], root);
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── experiments ───────────────────────────────────────────
    api.registerTool({
      name: "experiments",
      description:
        "Manage self-experiments: create new experiments, daily check-ins, analyze results, or run gap report",
      parameters: Type.Object({
        command: Type.Union([
          Type.Literal("create"),
          Type.Literal("checkin"),
          Type.Literal("analyze"),
          Type.Literal("gap_report"),
        ]),
        input_json: Type.Optional(
          Type.Object({}, { additionalProperties: true, description: "Payload for create/checkin" }),
        ),
        experiment_id: Type.Optional(
          Type.String({ description: "Experiment ID for analyze command" }),
        ),
      }),
      async execute(_id, params) {
        const script = join(root, "scripts/insights/experiments.py");
        const subcmd = params.command === "gap_report" ? "gap-report" : params.command;

        let stdout: string;
        if (params.command === "gap_report") {
          stdout = await run(py, [script, "--data-root", dataRoot, "gap-report"], root);
        } else if (params.command === "analyze") {
          stdout = await run(py, [script, "--data-root", dataRoot, "analyze", "--experiment-id", params.experiment_id!], root);
        } else {
          stdout = await withTempJson(params.input_json, (path) =>
            run(py, [script, "--data-root", dataRoot, subcmd, "--input-json", path], root),
          );
        }
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── news_digest ───────────────────────────────────────────
    api.registerTool({
      name: "news_digest",
      description: "Fetch and rank curated health and longevity news from RSS feeds",
      parameters: Type.Object({
        limit: Type.Optional(Type.Number({ description: "Max articles to return", default: 6 })),
      }),
      async execute(_id, params) {
        const stdout = await run(py, [
          join(root, "scripts/news/fetch_digest.py"),
          "--data-root", dataRoot,
          "--limit", String(params.limit ?? 6),
        ], root);
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── coaching_context ──────────────────────────────────────
    api.registerTool({
      name: "coaching_context",
      description:
        "Generate personalized (daily) coaching context by analyzing nutrition, health, experiment, and news data to give user personalized recommendations",
      parameters: Type.Object({
        today_date: Type.Optional(Type.String({ description: "Override today's date (YYYY-MM-DD)" })),
        news_limit: Type.Optional(Type.Number({ description: "Max news items to include", default: 2 })),
      }),
      async execute(_id, params) {
        const args = [
          join(root, "scripts/coach/daily_health_coach.py"),
          "--data-root", dataRoot,
        ];
        if (params.today_date) args.push("--today-date", params.today_date);
        if (params.news_limit != null) args.push("--news-limit", String(params.news_limit));
        const stdout = await run(py, args, root);
        return { content: [{ type: "text", text: stdout }] };
      },
    });
  },
});
