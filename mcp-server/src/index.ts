#!/usr/bin/env node
/**
 * Turri MCP Server
 *
 * Exposes Turri's health-companion tools (nutrition, Whoop, experiments,
 * coaching, news) over the Model Context Protocol so any MCP-compatible
 * client (Claude Code, Claude Desktop, Cursor, etc.) can use them.
 *
 * All heavy lifting is delegated to the existing Python scripts in
 * ../scripts/ — this server is a thin MCP adapter.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execFile } from "node:child_process";
import { writeFile, readFile, unlink, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// When running from dist/ or src/, project root is two levels up
const PROJECT_ROOT = resolve(__dirname, "../..");
const DATA_ROOT =
  process.env.TURRI_DATA_ROOT || join(PROJECT_ROOT, "longevityOS-data");
const PYTHON = process.env.TURRI_PYTHON || "python3";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { cwd, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout);
      },
    );
  });
}

async function withTempJson<T>(
  data: unknown,
  fn: (path: string) => Promise<T>,
): Promise<T> {
  const path = join(tmpdir(), `turri-mcp-${randomUUID()}.json`);
  await writeFile(path, JSON.stringify(data));
  try {
    return await fn(path);
  } finally {
    await unlink(path).catch(() => {});
  }
}

function script(name: string): string {
  return join(PROJECT_ROOT, "scripts", name);
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "turri",
  version: "1.0.0",
  description:
    "Personal health companion — meal logging, Whoop integration, self-experiments, coaching, and longevity news",
});

// ── nutrition ──────────────────────────────────────────────────────────────

server.tool(
  "nutrition",
  "Log meals with ingredient-level nutrition enrichment, get daily totals, or weekly summary vs RDA targets",
  {
    command: z
      .enum(["log", "daily_summary", "weekly_summary"])
      .describe("Action to perform"),
    input_json: z
      .record(z.unknown())
      .optional()
      .describe("Meal payload for the 'log' command (see snap skill docs)"),
    date: z
      .string()
      .optional()
      .describe("ISO date for daily_summary (YYYY-MM-DD)"),
    end_date: z
      .string()
      .optional()
      .describe("End date for weekly_summary (YYYY-MM-DD)"),
    days: z
      .number()
      .optional()
      .default(7)
      .describe("Number of days for weekly_summary"),
    rda_profile: z
      .string()
      .optional()
      .default("default")
      .describe("RDA profile: default, male_19_50, female_19_50"),
  },
  async ({ command, input_json, date, end_date, days, rda_profile }) => {
    let stdout: string;
    switch (command) {
      case "log":
        stdout = await withTempJson(input_json ?? {}, (path) =>
          run(
            PYTHON,
            [
              script("nutrition/estimate_and_log.py"),
              "--data-root",
              DATA_ROOT,
              "log",
              "--input-json",
              path,
            ],
            PROJECT_ROOT,
          ),
        );
        break;
      case "daily_summary":
        stdout = await run(
          PYTHON,
          [
            script("nutrition/daily_summary.py"),
            "--data-root",
            DATA_ROOT,
            "--date",
            date!,
          ],
          PROJECT_ROOT,
        );
        break;
      case "weekly_summary":
        stdout = await run(
          PYTHON,
          [
            script("nutrition/weekly_summary.py"),
            "--data-root",
            DATA_ROOT,
            "--end-date",
            end_date!,
            "--days",
            String(days ?? 7),
            "--rda-profile",
            rda_profile ?? "default",
          ],
          PROJECT_ROOT,
        );
        break;
    }
    return textResult(stdout!);
  },
);

// ── health_profile ────────────────────────────────────────────────────────

server.tool(
  "health_profile",
  "Manage health profile: merge questionnaire answers, merge Whoop import, or show current profile",
  {
    command: z
      .enum(["merge_questionnaire", "merge_import", "show"])
      .describe("Action to perform"),
    input_json: z
      .record(z.unknown())
      .optional()
      .describe("Payload for merge commands"),
  },
  async ({ command, input_json }) => {
    const profileScript = script("health/profile_store.py");
    const subcmd =
      command === "merge_questionnaire"
        ? "merge-questionnaire"
        : command === "merge_import"
          ? "merge-import"
          : "show";

    let stdout: string;
    if (subcmd === "show") {
      stdout = await run(
        PYTHON,
        [profileScript, "--data-root", DATA_ROOT, "show"],
        PROJECT_ROOT,
      );
    } else {
      stdout = await withTempJson(input_json ?? {}, (path) =>
        run(
          PYTHON,
          [profileScript, "--data-root", DATA_ROOT, subcmd, "--input-json", path],
          PROJECT_ROOT,
        ),
      );
    }
    return textResult(stdout);
  },
);

// ── whoop_initiate ────────────────────────────────────────────────────────

server.tool(
  "whoop_initiate",
  "First-time Whoop setup: validate saved OAuth tokens and fetch initial data. Use only during onboarding — for ongoing sync use whoop_sync instead.",
  {},
  async () => {
    const tokenFile = join(DATA_ROOT, "health/whoop_tokens.json");
    const stdout = await run(
      PYTHON,
      [script("health/import_whoop.py"), "--token-file", tokenFile],
      PROJECT_ROOT,
    );
    return textResult(stdout);
  },
);

// ── whoop_sync ────────────────────────────────────────────────────────────

server.tool(
  "whoop_sync",
  "Fetch latest Whoop data and merge it into the health profile in one step",
  {},
  async () => {
    const tokenFile = join(DATA_ROOT, "health/whoop_tokens.json");
    const importOut = await run(
      PYTHON,
      [script("health/import_whoop.py"), "--token-file", tokenFile],
      PROJECT_ROOT,
    );
    const mergeOut = await withTempJson(JSON.parse(importOut), (path) =>
      run(
        PYTHON,
        [
          script("health/profile_store.py"),
          "--data-root",
          DATA_ROOT,
          "merge-import",
          "--input-json",
          path,
        ],
        PROJECT_ROOT,
      ),
    );
    return textResult(mergeOut);
  },
);

// ── experiments ───────────────────────────────────────────────────────────

server.tool(
  "experiments",
  "Manage self-experiments: create new experiments, daily check-ins, analyze results, or run gap report",
  {
    command: z
      .enum(["create", "checkin", "analyze", "gap_report"])
      .describe("Action to perform"),
    input_json: z
      .record(z.unknown())
      .optional()
      .describe("Payload for create/checkin"),
    experiment_id: z
      .string()
      .optional()
      .describe("Experiment ID for the analyze command"),
  },
  async ({ command, input_json, experiment_id }) => {
    const expScript = script("insights/experiments.py");

    let stdout: string;
    if (command === "gap_report") {
      stdout = await run(
        PYTHON,
        [expScript, "--data-root", DATA_ROOT, "gap-report"],
        PROJECT_ROOT,
      );
    } else if (command === "analyze") {
      stdout = await run(
        PYTHON,
        [
          expScript,
          "--data-root",
          DATA_ROOT,
          "analyze",
          "--experiment-id",
          experiment_id!,
        ],
        PROJECT_ROOT,
      );
    } else {
      const subcmd = command;
      stdout = await withTempJson(input_json ?? {}, (path) =>
        run(
          PYTHON,
          [expScript, "--data-root", DATA_ROOT, subcmd, "--input-json", path],
          PROJECT_ROOT,
        ),
      );
    }
    return textResult(stdout);
  },
);

// ── news_digest ──────────────────────────────────────────────────────────

server.tool(
  "news_digest",
  "Fetch and rank curated health and longevity news from RSS feeds",
  {
    limit: z
      .number()
      .optional()
      .default(6)
      .describe("Max articles to return"),
  },
  async ({ limit }) => {
    const stdout = await run(
      PYTHON,
      [
        script("news/fetch_digest.py"),
        "--data-root",
        DATA_ROOT,
        "--limit",
        String(limit ?? 6),
      ],
      PROJECT_ROOT,
    );
    return textResult(stdout);
  },
);

// ── coaching_context ─────────────────────────────────────────────────────

server.tool(
  "coaching_context",
  "Generate personalized daily coaching context by analyzing nutrition, health, experiment, and news data",
  {
    today_date: z
      .string()
      .optional()
      .describe("Override today's date (YYYY-MM-DD)"),
    news_limit: z
      .number()
      .optional()
      .default(2)
      .describe("Max news items to include"),
  },
  async ({ today_date, news_limit }) => {
    const args = [
      script("coach/daily_health_coach.py"),
      "--data-root",
      DATA_ROOT,
    ];
    if (today_date) args.push("--today-date", today_date);
    if (news_limit != null) args.push("--news-limit", String(news_limit));
    const stdout = await run(PYTHON, args, PROJECT_ROOT);
    return textResult(stdout);
  },
);

// ── Prompts ──────────────────────────────────────────────────────────────

server.prompt(
  "snap",
  "Log a meal from a description or photo — returns ingredient-level nutrition with full micronutrient breakdown",
  { description: z.string().describe("What the user ate, e.g. 'salmon with rice and steamed broccoli'") },
  ({ description }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            `Log this meal: ${description}`,
            "",
            "Instructions:",
            "1. Decompose into ingredients with estimated weights.",
            "2. Call the nutrition tool with command 'log' and the ingredient list.",
            "3. Show full micronutrient breakdown (Zn, Ca, VitD, Se, Fe, Folate, Omega-3, etc.) in compact inline format.",
            "4. Show today's running totals.",
          ].join("\n"),
        },
      },
    ],
  }),
);

server.prompt(
  "health-sync",
  "Sync latest Whoop data and show a health summary",
  {},
  () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Sync my Whoop data and show me a health summary.",
            "",
            "Instructions:",
            "1. Call whoop_sync to fetch latest data and merge into profile.",
            "2. Call health_profile with command 'show' to get the full profile.",
            "3. Present a concise summary of recovery, sleep, strain, and workout trends.",
          ].join("\n"),
        },
      },
    ],
  }),
);

server.prompt(
  "daily-coach",
  "Generate a personalized daily health coaching brief from all available data",
  {
    date: z.string().optional().describe("Date override (YYYY-MM-DD), defaults to today"),
  },
  ({ date }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Generate my daily health coaching brief.",
            "",
            "Instructions:",
            `1. Call coaching_context${date ? ` with today_date '${date}'` : ""} to gather all health, nutrition, experiment, and news data.`,
            "2. Analyze the context through these specialist lenses:",
            "   - Imperial Physician: #1 priority for the day",
            "   - Diet Physician: nutrition gaps and food suggestions",
            "   - Movement Master: recovery-adjusted training advice",
            "   - Pulse Reader: cardiovascular metric trends",
            "   - Formula Tester: cross-domain patterns",
            "   - Trial Monitor: active experiment compliance",
            "   - Court Magistrate: new experiment candidates",
            "   - Medical Censor: safety flags",
            "   - Herbalist: micronutrient gap analysis",
            "   - Court Scribe: relevant research connection",
            "3. Present each specialist's 2-3 sentence insight with their emoji prefix.",
          ].join("\n"),
        },
      },
    ],
  }),
);

server.prompt(
  "insights",
  "Run a gap report on self-experiments and suggest new experiments based on health data patterns",
  {},
  () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Analyze my health data patterns and self-experiments.",
            "",
            "Instructions:",
            "1. Call experiments with command 'gap_report' to see what areas lack data.",
            "2. Call health_profile with command 'show' to get current health context.",
            "3. Identify correlations and patterns worth investigating.",
            "4. Suggest structured N-of-1 experiments for the most promising patterns.",
          ].join("\n"),
        },
      },
    ],
  }),
);

// ── Resources ────────────────────────────────────────────────────────────

server.resource(
  "health-profile",
  "turri://health/profile",
  { description: "Current health profile (Whoop data, goals, constraints, preferences)", mimeType: "application/json" },
  async () => {
    try {
      const profilePath = join(DATA_ROOT, "health/profile.json");
      const content = await readFile(profilePath, "utf-8");
      return { contents: [{ uri: "turri://health/profile", text: content, mimeType: "application/json" }] };
    } catch {
      return { contents: [{ uri: "turri://health/profile", text: "{}", mimeType: "application/json" }] };
    }
  },
);

server.resource(
  "experiments",
  "turri://insights/experiments",
  { description: "Active and completed self-experiments", mimeType: "application/json" },
  async () => {
    try {
      const expPath = join(DATA_ROOT, "insights/experiments.json");
      const content = await readFile(expPath, "utf-8");
      return { contents: [{ uri: "turri://insights/experiments", text: content, mimeType: "application/json" }] };
    } catch {
      return { contents: [{ uri: "turri://insights/experiments", text: "[]", mimeType: "application/json" }] };
    }
  },
);

// ── Start ────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
