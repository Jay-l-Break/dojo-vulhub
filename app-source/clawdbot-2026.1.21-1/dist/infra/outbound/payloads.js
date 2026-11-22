export function normalizeOutboundPayloads(payloads) {
    return payloads
        .map((payload) => ({
        text: payload.text ?? "",
        mediaUrls: payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : []),
    }))
        .filter((payload) => payload.text || payload.mediaUrls.length > 0);
}
export function normalizeOutboundPayloadsForJson(payloads) {
    return payloads.map((payload) => ({
        text: payload.text ?? "",
        mediaUrl: payload.mediaUrl ?? null,
        mediaUrls: payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : undefined),
    }));
}
export function formatOutboundPayloadLog(payload) {
    const lines = [];
    if (payload.text)
        lines.push(payload.text.trimEnd());
    for (const url of payload.mediaUrls)
        lines.push(`MEDIA:${url}`);
    return lines.join("\n");
}
