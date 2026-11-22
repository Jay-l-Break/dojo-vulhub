import { loadConfig } from "../config/config.js";
import { setVerbose } from "../globals.js";
import { loginWeb, logoutWeb } from "../provider-web.js";
import { defaultRuntime } from "../runtime.js";
import { resolveWhatsAppAccount } from "../web/accounts.js";
function normalizeProvider(raw) {
    const value = String(raw ?? "whatsapp")
        .trim()
        .toLowerCase();
    if (value === "whatsapp" || value === "web")
        return value;
    throw new Error(`Unsupported provider: ${value}`);
}
export async function runProviderLogin(opts, runtime = defaultRuntime) {
    const provider = normalizeProvider(opts.provider);
    // Auth-only flow: do not mutate provider config here.
    setVerbose(Boolean(opts.verbose));
    await loginWeb(Boolean(opts.verbose), provider, undefined, runtime, opts.account);
}
export async function runProviderLogout(opts, runtime = defaultRuntime) {
    const _provider = normalizeProvider(opts.provider);
    // Auth-only flow: resolve account + clear session state only.
    const cfg = loadConfig();
    const account = resolveWhatsAppAccount({
        cfg,
        accountId: opts.account,
    });
    await logoutWeb({
        runtime,
        authDir: account.authDir,
        isLegacyAuthDir: account.isLegacyAuthDir,
    });
}
