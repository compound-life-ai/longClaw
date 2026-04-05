import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { execFile } from "node:child_process";
import { writeFile, unlink, appendFile, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Debug / observability  (see docs/observability.md)
// ---------------------------------------------------------------------------

let debugDir = "";
let traceFile = "";
let artifactsDir = "";

/** Correlation context stored by before_tool_call, read by execute(). */
const runContexts = new Map<string, { runId: string; sessionId: string }>();

/** LLM-generated tool call args per runId, for cross-layer diffing. */
const llmToolArgs = new Map<string, Map<string, Record<string, unknown>>>();

/** Consecutive failure counter per tool name. */
const failStreaks = new Map<string, { count: number; error: string; since: string }>();

/** Accumulates tool call stats within a session. */
let sessionStats = { total: 0, succeeded: 0, failed: 0, failures: [] as { tool: string; error: string }[] };

async function ensureDebugDirs() {
  await mkdir(debugDir, { recursive: true }).catch(() => {});
  await mkdir(artifactsDir, { recursive: true }).catch(() => {});
}

async function appendLog(entry: Record<string, unknown>) {
  try {
    await ensureDebugDirs();
    await appendFile(
      traceFile,
      JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n",
    );
  } catch { /* never block the main flow */ }
}

/**
 * Compute a shallow diff between what the LLM sent and what the SDK delivered.
 * Returns undefined when both sides match or when LLM args aren't available.
 */
function diffParams(
  llmArgs: Record<string, unknown> | undefined,
  sdkParams: Record<string, unknown>,
): Record<string, { llm: unknown; sdk: unknown }> | undefined {
  if (!llmArgs) return undefined;
  const diffs: Record<string, { llm: unknown; sdk: unknown }> = {};
  const allKeys = new Set([...Object.keys(llmArgs), ...Object.keys(sdkParams)]);
  for (const key of allKeys) {
    const l = JSON.stringify(llmArgs[key]);
    const s = JSON.stringify(sdkParams[key]);
    if (l !== s) diffs[key] = { llm: llmArgs[key], sdk: sdkParams[key] };
  }
  return Object.keys(diffs).length > 0 ? diffs : undefined;
}

/**
 * Extract tool_use blocks from the raw LLM assistant message.
 * Handles both Anthropic (type=tool_use, input) and OpenAI (type=function, arguments).
 */
function extractToolCalls(lastAssistant: unknown): { name: string; arguments: unknown }[] {
  if (!lastAssistant || typeof lastAssistant !== "object") return [];
  const msg = lastAssistant as Record<string, unknown>;
  const content = (msg.content || msg.tool_calls || []) as unknown[];
  if (!Array.isArray(content)) return [];
  const calls: { name: string; arguments: unknown }[] = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    if (b.type === "tool_use") {
      calls.push({ name: String(b.name), arguments: b.input });
    } else if (b.type === "function") {
      calls.push({ name: String(b.name), arguments: b.arguments });
    }
  }
  return calls;
}

// ---------------------------------------------------------------------------
// Subprocess runner
// ---------------------------------------------------------------------------

function run(
  cmd: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { cwd, maxBuffer: 4 * 1024 * 1024, env: env ? { ...process.env, ...env } : undefined },
      (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout);
      },
    );
  });
}

async function withTempJson(
  data: unknown,
  fn: (path: string) => Promise<string>,
  artifactLabel?: string,
): Promise<string> {
  const path = join(tmpdir(), `longclaw-${randomUUID()}.json`);
  await writeFile(path, JSON.stringify(data));
  try {
    return await fn(path);
  } catch (err) {
    // Preserve the temp file as evidence on failure
    if (artifactLabel && artifactsDir) {
      try {
        await ensureDebugDirs();
        const dest = join(artifactsDir, `${artifactLabel}.json`);
        await copyFile(path, dest);
        await appendLog({
          layer: "artifact",
          label: artifactLabel,
          dest,
          content: data,
          preserved_because: "execution_failed",
        });
      } catch { /* best effort */ }
    }
    throw err;
  } finally {
    await unlink(path).catch(() => {});
  }
}

/** Build env vars for Python subprocess correlation. */
function debugEnv(toolCallId: string): Record<string, string> {
  const ctx = runContexts.get(toolCallId);
  if (!ctx) return {};
  return {
    LONGCLAW_RUN_ID: ctx.runId,
    LONGCLAW_SESSION_ID: ctx.sessionId,
    LONGCLAW_TOOL_CALL_ID: toolCallId,
  };
}

// ---------------------------------------------------------------------------
// Plugin entry
// ---------------------------------------------------------------------------

export default definePluginEntry({
  id: "compound-clawskill",
  name: "LongClaw",
  description:
    "Personal health companion with meal logging, Whoop integration, self-experiments, and daily coaching",

  register(api) {
    const root = api.resolvePath(".");
    const dataRoot = api.resolvePath("longevityOS-data");
    const py = "python3";

    // Resolve debug paths now that dataRoot is known
    debugDir = join(dataRoot, "debug");
    traceFile = join(debugDir, "trace.jsonl");
    artifactsDir = join(debugDir, "artifacts");

    // ── observability hooks ─────────────────────────────────────

    api.registerHook("session_start", async (event: any, ctx: any) => {
      sessionStats = { total: 0, succeeded: 0, failed: 0, failures: [] };
      await appendLog({
        layer: "session_start",
        sessionId: event.sessionId,
        sessionKey: event.sessionKey,
        resumedFrom: event.resumedFrom ?? null,
      });
    });

    api.registerHook("llm_output", async (event: any) => {
      const toolCalls = extractToolCalls(event.lastAssistant);
      // Store tool call args for cross-layer diffing in before_tool_call
      if (toolCalls.length > 0) {
        const argsMap = new Map<string, Record<string, unknown>>();
        for (const tc of toolCalls) {
          argsMap.set(String(tc.name), (tc.arguments ?? {}) as Record<string, unknown>);
        }
        llmToolArgs.set(event.runId, argsMap);
      }
      await appendLog({
        layer: "llm_output",
        runId: event.runId,
        sessionId: event.sessionId,
        provider: event.provider,
        model: event.model,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usage: event.usage,
      });
    });

    api.registerHook("before_tool_call", async (event: any, ctx: any) => {
      const toolCallId = event.toolCallId ?? randomUUID();
      const runId = event.runId ?? "";
      const sessionId = ctx?.sessionId ?? "";

      // Store context so execute() can pass env vars to Python
      runContexts.set(toolCallId, { runId, sessionId });

      // Cross-layer diff: compare LLM-generated args vs SDK-delivered params
      const llmArgs = llmToolArgs.get(runId)?.get(event.toolName);
      const paramDiff = diffParams(llmArgs, event.params ?? {});

      await appendLog({
        layer: "before_tool",
        runId,
        sessionId,
        toolCallId,
        toolName: event.toolName,
        params: event.params,
        ...(paramDiff ? { llm_diff: paramDiff } : {}),
      });
    });

    api.registerHook("after_tool_call", async (event: any, ctx: any) => {
      const toolCallId = event.toolCallId ?? "";
      const toolName = event.toolName;
      const error = event.error;

      // Streak detection
      let streak: Record<string, unknown> | undefined;
      if (error) {
        const prev = failStreaks.get(toolName);
        if (prev) {
          prev.count++;
          prev.error = error;
          streak = { consecutive_failures: prev.count, since: prev.since,
            same_error: prev.error === error,
            pattern: prev.count >= 3 ? "consistent_failure" : "recurring" };
        } else {
          failStreaks.set(toolName, { count: 1, error, since: new Date().toISOString() });
        }
        sessionStats.failed++;
        sessionStats.failures.push({ tool: toolName, error });
      } else {
        failStreaks.delete(toolName);
        sessionStats.succeeded++;
      }
      sessionStats.total++;

      await appendLog({
        layer: "after_tool",
        runId: event.runId ?? "",
        sessionId: ctx?.sessionId ?? "",
        toolCallId,
        toolName,
        durationMs: event.durationMs,
        error: error ?? null,
        ...(streak ? { streak } : {}),
      });

      // Cleanup correlation context
      runContexts.delete(toolCallId);
      if (event.runId) llmToolArgs.delete(event.runId);
    });

    api.registerHook("session_end", async (event: any) => {
      await appendLog({
        layer: "session_end",
        sessionId: event.sessionId,
        sessionKey: event.sessionKey,
        messageCount: event.messageCount,
        durationMs: event.durationMs,
        toolSummary: {
          total: sessionStats.total,
          succeeded: sessionStats.succeeded,
          failed: sessionStats.failed,
          failures: sessionStats.failures,
        },
        activeStreaks: Object.fromEntries(
          [...failStreaks.entries()]
            .filter(([, v]) => v.count >= 2)
            .map(([k, v]) => [k, v]),
        ),
      });
    });

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
        const env = debugEnv(_id);
        const label = `${env.LONGCLAW_RUN_ID || "unknown"}-${_id}`;
        let stdout: string;
        switch (params.command) {
          case "log":
            stdout = await withTempJson(
              params.input_json,
              (path) => run(py, [join(root, "scripts/nutrition/estimate_and_log.py"), "--data-root", dataRoot, "log", "--input-json", path], root, env),
              label,
            );
            break;
          case "daily_summary":
            stdout = await run(py, [
              join(root, "scripts/nutrition/daily_summary.py"),
              "--data-root", dataRoot,
              "--date", params.date!,
            ], root, env);
            break;
          case "weekly_summary":
            stdout = await run(py, [
              join(root, "scripts/nutrition/weekly_summary.py"),
              "--data-root", dataRoot,
              "--end-date", params.end_date!,
              "--days", String(params.days ?? 7),
              "--rda-profile", params.rda_profile ?? "default",
            ], root, env);
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
        const env = debugEnv(_id);
        const label = `${env.LONGCLAW_RUN_ID || "unknown"}-${_id}`;
        const script = join(root, "scripts/health/profile_store.py");
        const subcmd = params.command === "merge_questionnaire"
          ? "merge-questionnaire"
          : params.command === "merge_import"
            ? "merge-import"
            : "show";

        let stdout: string;
        if (subcmd === "show") {
          stdout = await run(py, [script, "--data-root", dataRoot, "show"], root, env);
        } else {
          stdout = await withTempJson(
            params.input_json,
            (path) => run(py, [script, "--data-root", dataRoot, subcmd, "--input-json", path], root, env),
            label,
          );
        }
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── whoop_initiate ─────────────────────────────────────────
    api.registerTool({
      name: "whoop_initiate",
      description:
        "First-time Whoop setup: validate saved OAuth tokens and fetch initial data from the Whoop API. Use this only during onboarding after the user completes the OAuth flow and saves their tokens. For ongoing data sync, use whoop_sync instead.",
      parameters: Type.Object({}),
      async execute(_id) {
        const env = debugEnv(_id);
        const tokenFile = join(dataRoot, "health/whoop_tokens.json");
        const stdout = await run(py, [
          join(root, "scripts/health/import_whoop.py"),
          "--token-file", tokenFile,
        ], root, env);
        return { content: [{ type: "text", text: stdout }] };
      },
    });

    // ── whoop_sync ─────────────────────────────────────────────
    api.registerTool({
      name: "whoop_sync",
      description:
        "Fetch latest Whoop data and merge it into the health profile in one step",
      parameters: Type.Object({}),
      async execute(_id) {
        const env = debugEnv(_id);
        const label = `${env.LONGCLAW_RUN_ID || "unknown"}-${_id}`;
        const tokenFile = join(dataRoot, "health/whoop_tokens.json");
        const importOut = await run(py, [
          join(root, "scripts/health/import_whoop.py"),
          "--token-file", tokenFile,
        ], root, env);
        const mergeOut = await withTempJson(
          JSON.parse(importOut),
          (path) => run(py, [
            join(root, "scripts/health/profile_store.py"),
            "--data-root", dataRoot, "merge-import", "--input-json", path,
          ], root, env),
          label,
        );
        return { content: [{ type: "text", text: mergeOut }] };
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
        const env = debugEnv(_id);
        const label = `${env.LONGCLAW_RUN_ID || "unknown"}-${_id}`;
        const script = join(root, "scripts/insights/experiments.py");
        const subcmd = params.command === "gap_report" ? "gap-report" : params.command;

        let stdout: string;
        if (params.command === "gap_report") {
          stdout = await run(py, [script, "--data-root", dataRoot, "gap-report"], root, env);
        } else if (params.command === "analyze") {
          stdout = await run(py, [script, "--data-root", dataRoot, "analyze", "--experiment-id", params.experiment_id!], root, env);
        } else {
          stdout = await withTempJson(
            params.input_json,
            (path) => run(py, [script, "--data-root", dataRoot, subcmd, "--input-json", path], root, env),
            label,
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
        const env = debugEnv(_id);
        const stdout = await run(py, [
          join(root, "scripts/news/fetch_digest.py"),
          "--data-root", dataRoot,
          "--limit", String(params.limit ?? 6),
        ], root, env);
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
        const env = debugEnv(_id);
        const args = [
          join(root, "scripts/coach/daily_health_coach.py"),
          "--data-root", dataRoot,
        ];
        if (params.today_date) args.push("--today-date", params.today_date);
        if (params.news_limit != null) args.push("--news-limit", String(params.news_limit));
        const stdout = await run(py, args, root, env);
        return { content: [{ type: "text", text: stdout }] };
      },
    });
  },
});
