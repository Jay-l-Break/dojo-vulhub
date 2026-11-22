export const CHAT_PROVIDER_ORDER = [
    "telegram",
    "whatsapp",
    "discord",
    "slack",
    "signal",
    "imessage",
];
const CHAT_PROVIDER_META = {
    telegram: {
        id: "telegram",
        label: "Telegram",
        selectionLabel: "Telegram (Bot API)",
        docsPath: "/telegram",
        docsLabel: "telegram",
        blurb: "simplest way to get started — register a bot with @BotFather and get going.",
    },
    whatsapp: {
        id: "whatsapp",
        label: "WhatsApp",
        selectionLabel: "WhatsApp (QR link)",
        docsPath: "/whatsapp",
        docsLabel: "whatsapp",
        blurb: "works with your own number; recommend a separate phone + eSIM.",
    },
    discord: {
        id: "discord",
        label: "Discord",
        selectionLabel: "Discord (Bot API)",
        docsPath: "/discord",
        docsLabel: "discord",
        blurb: "very well supported right now.",
    },
    slack: {
        id: "slack",
        label: "Slack",
        selectionLabel: "Slack (Socket Mode)",
        docsPath: "/slack",
        docsLabel: "slack",
        blurb: "supported (Socket Mode).",
    },
    signal: {
        id: "signal",
        label: "Signal",
        selectionLabel: "Signal (signal-cli)",
        docsPath: "/signal",
        docsLabel: "signal",
        blurb: 'signal-cli linked device; more setup (David Reagans: "Hop on Discord.").',
    },
    imessage: {
        id: "imessage",
        label: "iMessage",
        selectionLabel: "iMessage (imsg)",
        docsPath: "/imessage",
        docsLabel: "imessage",
        blurb: "this is still a work in progress.",
    },
};
const CHAT_PROVIDER_ALIASES = {
    imsg: "imessage",
};
const WEBSITE_URL = "https://clawd.bot";
export function listChatProviders() {
    return CHAT_PROVIDER_ORDER.map((id) => CHAT_PROVIDER_META[id]);
}
export function getChatProviderMeta(id) {
    return CHAT_PROVIDER_META[id];
}
export function normalizeChatProviderId(raw) {
    const trimmed = (raw ?? "").trim().toLowerCase();
    if (!trimmed)
        return null;
    const normalized = CHAT_PROVIDER_ALIASES[trimmed] ?? trimmed;
    return CHAT_PROVIDER_ORDER.includes(normalized)
        ? normalized
        : null;
}
export function formatProviderPrimerLine(meta) {
    return `${meta.label}: ${meta.blurb}`;
}
export function formatProviderSelectionLine(meta, docsLink) {
    if (meta.id === "telegram") {
        return `${meta.label} — ${meta.blurb} ${docsLink(meta.docsPath)} ${WEBSITE_URL}`;
    }
    return `${meta.label} — ${meta.blurb} Docs: ${docsLink(meta.docsPath, meta.docsLabel ?? meta.id)}`;
}
