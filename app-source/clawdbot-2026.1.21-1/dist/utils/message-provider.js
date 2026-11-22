export function normalizeMessageProvider(raw) {
    const normalized = raw?.trim().toLowerCase();
    if (!normalized)
        return undefined;
    if (normalized === "imsg")
        return "imessage";
    if (normalized === "teams")
        return "msteams";
    return normalized;
}
export function resolveMessageProvider(primary, fallback) {
    return (normalizeMessageProvider(primary) ?? normalizeMessageProvider(fallback));
}
