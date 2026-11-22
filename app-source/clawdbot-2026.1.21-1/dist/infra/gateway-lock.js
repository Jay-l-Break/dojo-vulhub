import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveConfigPath, resolveStateDir } from "../config/paths.js";
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_POLL_INTERVAL_MS = 100;
const DEFAULT_STALE_MS = 30_000;
export class GatewayLockError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "GatewayLockError";
    }
}
function isAlive(pid) {
    if (!Number.isFinite(pid) || pid <= 0)
        return false;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
async function readLockPayload(lockPath) {
    try {
        const raw = await fs.readFile(lockPath, "utf8");
        const parsed = JSON.parse(raw);
        if (typeof parsed.pid !== "number")
            return null;
        if (typeof parsed.createdAt !== "string")
            return null;
        if (typeof parsed.configPath !== "string")
            return null;
        return {
            pid: parsed.pid,
            createdAt: parsed.createdAt,
            configPath: parsed.configPath,
        };
    }
    catch {
        return null;
    }
}
function resolveGatewayLockPath(env) {
    const stateDir = resolveStateDir(env);
    const configPath = resolveConfigPath(env, stateDir);
    const hash = createHash("sha1").update(configPath).digest("hex").slice(0, 8);
    const lockPath = path.join(stateDir, `gateway.${hash}.lock`);
    return { lockPath, configPath };
}
export async function acquireGatewayLock(opts = {}) {
    const env = opts.env ?? process.env;
    const allowInTests = opts.allowInTests === true;
    if (env.CLAWDBOT_ALLOW_MULTI_GATEWAY === "1" ||
        (!allowInTests && (env.VITEST || env.NODE_ENV === "test"))) {
        return null;
    }
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pollIntervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    const staleMs = opts.staleMs ?? DEFAULT_STALE_MS;
    const { lockPath, configPath } = resolveGatewayLockPath(env);
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    const startedAt = Date.now();
    let lastPayload = null;
    while (Date.now() - startedAt < timeoutMs) {
        try {
            const handle = await fs.open(lockPath, "wx");
            const payload = {
                pid: process.pid,
                createdAt: new Date().toISOString(),
                configPath,
            };
            await handle.writeFile(JSON.stringify(payload), "utf8");
            return {
                lockPath,
                configPath,
                release: async () => {
                    await handle.close().catch(() => undefined);
                    await fs.rm(lockPath, { force: true });
                },
            };
        }
        catch (err) {
            const code = err.code;
            if (code !== "EEXIST") {
                throw new GatewayLockError(`failed to acquire gateway lock at ${lockPath}`, err);
            }
            lastPayload = await readLockPayload(lockPath);
            const ownerPid = lastPayload?.pid;
            const ownerAlive = ownerPid ? isAlive(ownerPid) : false;
            if (!ownerAlive && ownerPid) {
                await fs.rm(lockPath, { force: true });
                continue;
            }
            if (!ownerAlive) {
                let stale = false;
                if (lastPayload?.createdAt) {
                    const createdAt = Date.parse(lastPayload.createdAt);
                    stale = Number.isFinite(createdAt) ? Date.now() - createdAt > staleMs : false;
                }
                if (!stale) {
                    try {
                        const st = await fs.stat(lockPath);
                        stale = Date.now() - st.mtimeMs > staleMs;
                    }
                    catch {
                        stale = true;
                    }
                }
                if (stale) {
                    await fs.rm(lockPath, { force: true });
                    continue;
                }
            }
            await new Promise((r) => setTimeout(r, pollIntervalMs));
        }
    }
    const owner = lastPayload?.pid ? ` (pid ${lastPayload.pid})` : "";
    throw new GatewayLockError(`gateway already running${owner}; lock timeout after ${timeoutMs}ms`);
}
