import { resolveTextChunkLimit } from "../../auto-reply/chunk.js";
import { resolveChannelMediaMaxBytes } from "../../channels/plugins/media-limits.js";
import { loadChannelOutboundAdapter } from "../../channels/plugins/outbound/load.js";
import { markdownToSignalTextChunks } from "../../signal/format.js";
import { sendMessageSignal } from "../../signal/send.js";
import { appendAssistantMessageToSessionTranscript, resolveMirroredTranscriptText, } from "../../config/sessions.js";
import { normalizeOutboundPayloads } from "./payloads.js";
export { normalizeOutboundPayloads } from "./payloads.js";
function throwIfAborted(abortSignal) {
    if (abortSignal?.aborted) {
        throw new Error("Outbound delivery aborted");
    }
}
// Channel docking: outbound delivery delegates to plugin.outbound adapters.
async function createChannelHandler(params) {
    const outbound = await loadChannelOutboundAdapter(params.channel);
    if (!outbound?.sendText || !outbound?.sendMedia) {
        throw new Error(`Outbound not configured for channel: ${params.channel}`);
    }
    const handler = createPluginHandler({
        outbound,
        cfg: params.cfg,
        channel: params.channel,
        to: params.to,
        accountId: params.accountId,
        replyToId: params.replyToId,
        threadId: params.threadId,
        deps: params.deps,
        gifPlayback: params.gifPlayback,
    });
    if (!handler) {
        throw new Error(`Outbound not configured for channel: ${params.channel}`);
    }
    return handler;
}
function createPluginHandler(params) {
    const outbound = params.outbound;
    if (!outbound?.sendText || !outbound?.sendMedia)
        return null;
    const sendText = outbound.sendText;
    const sendMedia = outbound.sendMedia;
    const chunker = outbound.chunker ?? null;
    return {
        chunker,
        textChunkLimit: outbound.textChunkLimit,
        sendText: async (text) => sendText({
            cfg: params.cfg,
            to: params.to,
            text,
            accountId: params.accountId,
            replyToId: params.replyToId,
            threadId: params.threadId,
            gifPlayback: params.gifPlayback,
            deps: params.deps,
        }),
        sendMedia: async (caption, mediaUrl) => sendMedia({
            cfg: params.cfg,
            to: params.to,
            text: caption,
            mediaUrl,
            accountId: params.accountId,
            replyToId: params.replyToId,
            threadId: params.threadId,
            gifPlayback: params.gifPlayback,
            deps: params.deps,
        }),
    };
}
export async function deliverOutboundPayloads(params) {
    const { cfg, channel, to, payloads } = params;
    const accountId = params.accountId;
    const deps = params.deps;
    const abortSignal = params.abortSignal;
    const sendSignal = params.deps?.sendSignal ?? sendMessageSignal;
    const results = [];
    const handler = await createChannelHandler({
        cfg,
        channel,
        to,
        deps,
        accountId,
        replyToId: params.replyToId,
        threadId: params.threadId,
        gifPlayback: params.gifPlayback,
    });
    const textLimit = handler.chunker
        ? resolveTextChunkLimit(cfg, channel, accountId, {
            fallbackLimit: handler.textChunkLimit,
        })
        : undefined;
    const isSignalChannel = channel === "signal";
    const signalMaxBytes = isSignalChannel
        ? resolveChannelMediaMaxBytes({
            cfg,
            resolveChannelLimitMb: ({ cfg, accountId }) => cfg.channels?.signal?.accounts?.[accountId]?.mediaMaxMb ??
                cfg.channels?.signal?.mediaMaxMb,
            accountId,
        })
        : undefined;
    const sendTextChunks = async (text) => {
        throwIfAborted(abortSignal);
        if (!handler.chunker || textLimit === undefined) {
            results.push(await handler.sendText(text));
            return;
        }
        for (const chunk of handler.chunker(text, textLimit)) {
            throwIfAborted(abortSignal);
            results.push(await handler.sendText(chunk));
        }
    };
    const sendSignalText = async (text, styles) => {
        throwIfAborted(abortSignal);
        return {
            channel: "signal",
            ...(await sendSignal(to, text, {
                maxBytes: signalMaxBytes,
                accountId: accountId ?? undefined,
                textMode: "plain",
                textStyles: styles,
            })),
        };
    };
    const sendSignalTextChunks = async (text) => {
        throwIfAborted(abortSignal);
        let signalChunks = textLimit === undefined
            ? markdownToSignalTextChunks(text, Number.POSITIVE_INFINITY)
            : markdownToSignalTextChunks(text, textLimit);
        if (signalChunks.length === 0 && text) {
            signalChunks = [{ text, styles: [] }];
        }
        for (const chunk of signalChunks) {
            throwIfAborted(abortSignal);
            results.push(await sendSignalText(chunk.text, chunk.styles));
        }
    };
    const sendSignalMedia = async (caption, mediaUrl) => {
        throwIfAborted(abortSignal);
        const formatted = markdownToSignalTextChunks(caption, Number.POSITIVE_INFINITY)[0] ?? {
            text: caption,
            styles: [],
        };
        return {
            channel: "signal",
            ...(await sendSignal(to, formatted.text, {
                mediaUrl,
                maxBytes: signalMaxBytes,
                accountId: accountId ?? undefined,
                textMode: "plain",
                textStyles: formatted.styles,
            })),
        };
    };
    const normalizedPayloads = normalizeOutboundPayloads(payloads);
    for (const payload of normalizedPayloads) {
        try {
            throwIfAborted(abortSignal);
            params.onPayload?.(payload);
            if (payload.mediaUrls.length === 0) {
                if (isSignalChannel) {
                    await sendSignalTextChunks(payload.text);
                }
                else {
                    await sendTextChunks(payload.text);
                }
                continue;
            }
            let first = true;
            for (const url of payload.mediaUrls) {
                throwIfAborted(abortSignal);
                const caption = first ? payload.text : "";
                first = false;
                if (isSignalChannel) {
                    results.push(await sendSignalMedia(caption, url));
                }
                else {
                    results.push(await handler.sendMedia(caption, url));
                }
            }
        }
        catch (err) {
            if (!params.bestEffort)
                throw err;
            params.onError?.(err, payload);
        }
    }
    if (params.mirror && results.length > 0) {
        const mirrorText = resolveMirroredTranscriptText({
            text: params.mirror.text,
            mediaUrls: params.mirror.mediaUrls,
        });
        if (mirrorText) {
            await appendAssistantMessageToSessionTranscript({
                agentId: params.mirror.agentId,
                sessionKey: params.mirror.sessionKey,
                text: mirrorText,
            });
        }
    }
    return results;
}
