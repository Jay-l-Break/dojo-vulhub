import { normalizeMainKey } from "../../routing/session-key.js";
function normalizeKey(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
export function resolveMainSessionAlias(cfg) {
    const mainKey = normalizeMainKey(cfg.session?.mainKey);
    const scope = cfg.session?.scope ?? "per-sender";
    const alias = scope === "global" ? "global" : mainKey;
    return { mainKey, alias, scope };
}
export function resolveDisplaySessionKey(params) {
    if (params.key === params.alias)
        return "main";
    if (params.key === params.mainKey)
        return "main";
    return params.key;
}
export function resolveInternalSessionKey(params) {
    if (params.key === "main")
        return params.alias;
    return params.key;
}
export function classifySessionKind(params) {
    const key = params.key;
    if (key === params.alias || key === params.mainKey)
        return "main";
    if (key.startsWith("cron:"))
        return "cron";
    if (key.startsWith("hook:"))
        return "hook";
    if (key.startsWith("node-") || key.startsWith("node:"))
        return "node";
    if (params.gatewayKind === "group")
        return "group";
    if (key.includes(":group:") || key.includes(":channel:")) {
        return "group";
    }
    return "other";
}
export function deriveChannel(params) {
    if (params.kind === "cron" || params.kind === "hook" || params.kind === "node")
        return "internal";
    const channel = normalizeKey(params.channel ?? undefined);
    if (channel)
        return channel;
    const lastChannel = normalizeKey(params.lastChannel ?? undefined);
    if (lastChannel)
        return lastChannel;
    const parts = params.key.split(":").filter(Boolean);
    if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) {
        return parts[0];
    }
    return "unknown";
}
export function stripToolMessages(messages) {
    return messages.filter((msg) => {
        if (!msg || typeof msg !== "object")
            return true;
        const role = msg.role;
        return role !== "toolResult";
    });
}
export function extractAssistantText(message) {
    if (!message || typeof message !== "object")
        return undefined;
    if (message.role !== "assistant")
        return undefined;
    const content = message.content;
    if (!Array.isArray(content))
        return undefined;
    const chunks = [];
    for (const block of content) {
        if (!block || typeof block !== "object")
            continue;
        if (block.type !== "text")
            continue;
        const text = block.text;
        if (typeof text === "string" && text.trim()) {
            chunks.push(text);
        }
    }
    const joined = chunks.join("").trim();
    return joined ? joined : undefined;
}
