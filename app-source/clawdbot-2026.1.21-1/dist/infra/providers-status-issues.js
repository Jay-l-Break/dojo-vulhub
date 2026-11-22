function asString(value) {
    return typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : undefined;
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function readDiscordAccountStatus(value) {
    if (!isRecord(value))
        return null;
    return {
        accountId: value.accountId,
        enabled: value.enabled,
        configured: value.configured,
        application: value.application,
        audit: value.audit,
    };
}
function readDiscordApplicationSummary(value) {
    if (!isRecord(value))
        return {};
    const intentsRaw = value.intents;
    if (!isRecord(intentsRaw))
        return {};
    return {
        intents: {
            messageContent: intentsRaw.messageContent === "enabled" ||
                intentsRaw.messageContent === "limited" ||
                intentsRaw.messageContent === "disabled"
                ? intentsRaw.messageContent
                : undefined,
        },
    };
}
function readDiscordPermissionsAuditSummary(value) {
    if (!isRecord(value))
        return {};
    const unresolvedChannels = typeof value.unresolvedChannels === "number" &&
        Number.isFinite(value.unresolvedChannels)
        ? value.unresolvedChannels
        : undefined;
    const channelsRaw = value.channels;
    const channels = Array.isArray(channelsRaw)
        ? channelsRaw
            .map((entry) => {
            if (!isRecord(entry))
                return null;
            const channelId = asString(entry.channelId);
            if (!channelId)
                return null;
            const ok = typeof entry.ok === "boolean" ? entry.ok : undefined;
            const missing = Array.isArray(entry.missing)
                ? entry.missing.map((v) => asString(v)).filter(Boolean)
                : undefined;
            const error = asString(entry.error) ?? null;
            return {
                channelId,
                ok,
                missing: missing?.length ? missing : undefined,
                error,
            };
        })
            .filter(Boolean)
        : undefined;
    return { unresolvedChannels, channels };
}
function readTelegramAccountStatus(value) {
    if (!isRecord(value))
        return null;
    return {
        accountId: value.accountId,
        enabled: value.enabled,
        configured: value.configured,
        allowUnmentionedGroups: value.allowUnmentionedGroups,
        audit: value.audit,
    };
}
function readTelegramGroupMembershipAuditSummary(value) {
    if (!isRecord(value))
        return {};
    const unresolvedGroups = typeof value.unresolvedGroups === "number" &&
        Number.isFinite(value.unresolvedGroups)
        ? value.unresolvedGroups
        : undefined;
    const hasWildcardUnmentionedGroups = typeof value.hasWildcardUnmentionedGroups === "boolean"
        ? value.hasWildcardUnmentionedGroups
        : undefined;
    const groupsRaw = value.groups;
    const groups = Array.isArray(groupsRaw)
        ? groupsRaw
            .map((entry) => {
            if (!isRecord(entry))
                return null;
            const chatId = asString(entry.chatId);
            if (!chatId)
                return null;
            const ok = typeof entry.ok === "boolean" ? entry.ok : undefined;
            const status = asString(entry.status) ?? null;
            const error = asString(entry.error) ?? null;
            return { chatId, ok, status, error };
        })
            .filter(Boolean)
        : undefined;
    return { unresolvedGroups, hasWildcardUnmentionedGroups, groups };
}
function readWhatsAppAccountStatus(value) {
    if (!isRecord(value))
        return null;
    return {
        accountId: value.accountId,
        enabled: value.enabled,
        linked: value.linked,
        connected: value.connected,
        running: value.running,
        reconnectAttempts: value.reconnectAttempts,
        lastError: value.lastError,
    };
}
export function collectProvidersStatusIssues(payload) {
    const issues = [];
    const discordAccountsRaw = payload.discordAccounts;
    if (Array.isArray(discordAccountsRaw)) {
        for (const entry of discordAccountsRaw) {
            const account = readDiscordAccountStatus(entry);
            if (!account)
                continue;
            const accountId = asString(account.accountId) ?? "default";
            const enabled = account.enabled !== false;
            const configured = account.configured === true;
            if (!enabled || !configured)
                continue;
            const app = readDiscordApplicationSummary(account.application);
            const messageContent = app.intents?.messageContent;
            if (messageContent === "disabled") {
                issues.push({
                    provider: "discord",
                    accountId,
                    kind: "intent",
                    message: "Message Content Intent is disabled. Bot may not see normal channel messages.",
                    fix: "Enable Message Content Intent in Discord Dev Portal → Bot → Privileged Gateway Intents, or require mention-only operation.",
                });
            }
            const audit = readDiscordPermissionsAuditSummary(account.audit);
            if (audit.unresolvedChannels && audit.unresolvedChannels > 0) {
                issues.push({
                    provider: "discord",
                    accountId,
                    kind: "config",
                    message: `Some configured guild channels are not numeric IDs (unresolvedChannels=${audit.unresolvedChannels}). Permission audit can only check numeric channel IDs.`,
                    fix: "Use numeric channel IDs as keys in discord.guilds.*.channels (then rerun providers status --probe).",
                });
            }
            for (const channel of audit.channels ?? []) {
                if (channel.ok === true)
                    continue;
                const missing = channel.missing?.length
                    ? ` missing ${channel.missing.join(", ")}`
                    : "";
                const error = channel.error ? `: ${channel.error}` : "";
                issues.push({
                    provider: "discord",
                    accountId,
                    kind: "permissions",
                    message: `Channel ${channel.channelId} permission check failed.${missing}${error}`,
                    fix: "Ensure the bot role can view + send in this channel (and that channel overrides don't deny it).",
                });
            }
        }
    }
    const telegramAccountsRaw = payload.telegramAccounts;
    if (Array.isArray(telegramAccountsRaw)) {
        for (const entry of telegramAccountsRaw) {
            const account = readTelegramAccountStatus(entry);
            if (!account)
                continue;
            const accountId = asString(account.accountId) ?? "default";
            const enabled = account.enabled !== false;
            const configured = account.configured === true;
            if (!enabled || !configured)
                continue;
            if (account.allowUnmentionedGroups === true) {
                issues.push({
                    provider: "telegram",
                    accountId,
                    kind: "config",
                    message: "Config allows unmentioned group messages (requireMention=false). Telegram Bot API privacy mode will block most group messages unless disabled.",
                    fix: "In BotFather run /setprivacy → Disable for this bot (then restart the gateway).",
                });
            }
            const audit = readTelegramGroupMembershipAuditSummary(account.audit);
            if (audit.hasWildcardUnmentionedGroups === true) {
                issues.push({
                    provider: "telegram",
                    accountId,
                    kind: "config",
                    message: 'Telegram groups config uses "*" with requireMention=false; membership probing is not possible without explicit group IDs.',
                    fix: "Add explicit numeric group ids under telegram.groups (or per-account groups) to enable probing.",
                });
            }
            if (audit.unresolvedGroups && audit.unresolvedGroups > 0) {
                issues.push({
                    provider: "telegram",
                    accountId,
                    kind: "config",
                    message: `Some configured Telegram groups are not numeric IDs (unresolvedGroups=${audit.unresolvedGroups}). Membership probe can only check numeric group IDs.`,
                    fix: "Use numeric chat IDs (e.g. -100...) as keys in telegram.groups for requireMention=false groups.",
                });
            }
            for (const group of audit.groups ?? []) {
                if (group.ok === true)
                    continue;
                const status = group.status ? ` status=${group.status}` : "";
                const err = group.error ? `: ${group.error}` : "";
                issues.push({
                    provider: "telegram",
                    accountId,
                    kind: "runtime",
                    message: `Group ${group.chatId} not reachable by bot.${status}${err}`,
                    fix: "Invite the bot to the group, then DM the bot once (/start) and restart the gateway.",
                });
            }
        }
    }
    const whatsappAccountsRaw = payload.whatsappAccounts;
    if (Array.isArray(whatsappAccountsRaw)) {
        for (const entry of whatsappAccountsRaw) {
            const account = readWhatsAppAccountStatus(entry);
            if (!account)
                continue;
            const accountId = asString(account.accountId) ?? "default";
            const enabled = account.enabled !== false;
            if (!enabled)
                continue;
            const linked = account.linked === true;
            const running = account.running === true;
            const connected = account.connected === true;
            const reconnectAttempts = typeof account.reconnectAttempts === "number"
                ? account.reconnectAttempts
                : null;
            const lastError = asString(account.lastError);
            if (!linked) {
                issues.push({
                    provider: "whatsapp",
                    accountId,
                    kind: "auth",
                    message: "Not linked (no WhatsApp Web session).",
                    fix: "Run: clawdbot providers login (scan QR on the gateway host).",
                });
                continue;
            }
            if (running && !connected) {
                issues.push({
                    provider: "whatsapp",
                    accountId,
                    kind: "runtime",
                    message: `Linked but disconnected${reconnectAttempts != null ? ` (reconnectAttempts=${reconnectAttempts})` : ""}${lastError ? `: ${lastError}` : "."}`,
                    fix: "Run: clawdbot doctor (or restart the gateway). If it persists, relink via providers login and check logs.",
                });
            }
        }
    }
    return issues;
}
