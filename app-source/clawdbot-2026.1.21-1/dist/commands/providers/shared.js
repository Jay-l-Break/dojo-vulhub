import { readConfigFileSnapshot, } from "../../config/config.js";
import { getChatProviderMeta, } from "../../providers/registry.js";
import { DEFAULT_ACCOUNT_ID } from "../../routing/session-key.js";
import { defaultRuntime } from "../../runtime.js";
export async function requireValidConfig(runtime = defaultRuntime) {
    const snapshot = await readConfigFileSnapshot();
    if (snapshot.exists && !snapshot.valid) {
        const issues = snapshot.issues.length > 0
            ? snapshot.issues
                .map((issue) => `- ${issue.path}: ${issue.message}`)
                .join("\n")
            : "Unknown validation issue.";
        runtime.error(`Config invalid:\n${issues}`);
        runtime.error("Fix the config or run clawdbot doctor.");
        runtime.exit(1);
        return null;
    }
    return snapshot.config;
}
export function formatAccountLabel(params) {
    const base = params.accountId || DEFAULT_ACCOUNT_ID;
    if (params.name?.trim())
        return `${base} (${params.name.trim()})`;
    return base;
}
export const providerLabel = (provider) => getChatProviderMeta(provider).label;
export function formatProviderAccountLabel(params) {
    const providerText = providerLabel(params.provider);
    const accountText = formatAccountLabel({
        accountId: params.accountId,
        name: params.name,
    });
    const styledProvider = params.providerStyle
        ? params.providerStyle(providerText)
        : providerText;
    const styledAccount = params.accountStyle
        ? params.accountStyle(accountText)
        : accountText;
    return `${styledProvider} ${styledAccount}`;
}
export function shouldUseWizard(params) {
    return params?.hasFlags === false;
}
