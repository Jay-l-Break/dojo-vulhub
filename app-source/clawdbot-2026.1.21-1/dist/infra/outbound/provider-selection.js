import { listEnabledDiscordAccounts } from "../../discord/accounts.js";
import { listEnabledIMessageAccounts } from "../../imessage/accounts.js";
import { resolveMSTeamsCredentials } from "../../msteams/token.js";
import { listEnabledSignalAccounts } from "../../signal/accounts.js";
import { listEnabledSlackAccounts } from "../../slack/accounts.js";
import { listEnabledTelegramAccounts } from "../../telegram/accounts.js";
import { normalizeMessageProvider } from "../../utils/message-provider.js";
import { listEnabledWhatsAppAccounts, resolveWhatsAppAccount, } from "../../web/accounts.js";
import { webAuthExists } from "../../web/session.js";
const MESSAGE_PROVIDERS = [
    "whatsapp",
    "telegram",
    "discord",
    "slack",
    "signal",
    "imessage",
    "msteams",
];
function isKnownProvider(value) {
    return MESSAGE_PROVIDERS.includes(value);
}
async function isWhatsAppConfigured(cfg) {
    const accounts = listEnabledWhatsAppAccounts(cfg);
    if (accounts.length === 0) {
        const fallback = resolveWhatsAppAccount({ cfg });
        return await webAuthExists(fallback.authDir);
    }
    for (const account of accounts) {
        if (await webAuthExists(account.authDir))
            return true;
    }
    return false;
}
function isTelegramConfigured(cfg) {
    return listEnabledTelegramAccounts(cfg).some((account) => account.token.trim().length > 0);
}
function isDiscordConfigured(cfg) {
    return listEnabledDiscordAccounts(cfg).some((account) => account.token.trim().length > 0);
}
function isSlackConfigured(cfg) {
    return listEnabledSlackAccounts(cfg).some((account) => (account.botToken ?? "").trim().length > 0);
}
function isSignalConfigured(cfg) {
    return listEnabledSignalAccounts(cfg).some((account) => account.configured);
}
function isIMessageConfigured(cfg) {
    return listEnabledIMessageAccounts(cfg).some((account) => account.configured);
}
function isMSTeamsConfigured(cfg) {
    if (!cfg.msteams || cfg.msteams.enabled === false)
        return false;
    return Boolean(resolveMSTeamsCredentials(cfg.msteams));
}
export async function listConfiguredMessageProviders(cfg) {
    const providers = [];
    if (await isWhatsAppConfigured(cfg))
        providers.push("whatsapp");
    if (isTelegramConfigured(cfg))
        providers.push("telegram");
    if (isDiscordConfigured(cfg))
        providers.push("discord");
    if (isSlackConfigured(cfg))
        providers.push("slack");
    if (isSignalConfigured(cfg))
        providers.push("signal");
    if (isIMessageConfigured(cfg))
        providers.push("imessage");
    if (isMSTeamsConfigured(cfg))
        providers.push("msteams");
    return providers;
}
export async function resolveMessageProviderSelection(params) {
    const normalized = normalizeMessageProvider(params.provider);
    if (normalized) {
        if (!isKnownProvider(normalized)) {
            throw new Error(`Unknown provider: ${normalized}`);
        }
        return {
            provider: normalized,
            configured: await listConfiguredMessageProviders(params.cfg),
        };
    }
    const configured = await listConfiguredMessageProviders(params.cfg);
    if (configured.length === 1) {
        return { provider: configured[0], configured };
    }
    if (configured.length === 0) {
        throw new Error("Provider is required (no configured providers detected).");
    }
    throw new Error(`Provider is required when multiple providers are configured: ${configured.join(", ")}`);
}
