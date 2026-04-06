/**
 * Version update check for LongClaw.
 *
 * Separated from index.ts to keep network calls (fetch) isolated
 * from the main plugin entry point.
 */
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const REMOTE_PACKAGE_URL =
  "https://raw.githubusercontent.com/compound-life-ai/Turri/main/package.json";
const UPDATE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export type UpdateStatus = {
  local: string;
  remote: string | null;
  updateAvailable: boolean;
  checkedAt: string;
};

function updateCachePath(): string {
  return join(homedir(), ".longclaw-update-check");
}

async function readCachedUpdateStatus(): Promise<UpdateStatus | null> {
  try {
    const raw = await readFile(updateCachePath(), "utf-8");
    const cached = JSON.parse(raw) as UpdateStatus;
    const age = Date.now() - new Date(cached.checkedAt).getTime();
    if (age < UPDATE_CACHE_TTL_MS) return cached;
  } catch { /* no cache or expired */ }
  return null;
}

async function writeCachedUpdateStatus(status: UpdateStatus) {
  try {
    await writeFile(updateCachePath(), JSON.stringify(status));
  } catch { /* best effort */ }
}

function getLocalVersion(root: string): string {
  try {
    const pkg = require(join(root, "package.json"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const resp = await fetch(REMOTE_PACKAGE_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const pkg = await resp.json();
    return pkg.version || null;
  } catch {
    return null;
  }
}

function isNewerVersion(local: string, remote: string): boolean {
  const lp = local.split(".").map(Number);
  const rp = remote.split(".").map(Number);
  for (let i = 0; i < Math.max(lp.length, rp.length); i++) {
    const l = lp[i] ?? 0;
    const r = rp[i] ?? 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

export async function checkForUpdate(root: string): Promise<UpdateStatus> {
  const cached = await readCachedUpdateStatus();
  if (cached) return cached;

  const local = getLocalVersion(root);
  const remote = await fetchRemoteVersion();
  const status: UpdateStatus = {
    local,
    remote,
    updateAvailable: remote ? isNewerVersion(local, remote) : false,
    checkedAt: new Date().toISOString(),
  };

  await writeCachedUpdateStatus(status);
  return status;
}
