import { resolveSlackAccount } from "./accounts.js";
export function buildSlackThreadingToolContext(params) {
    const configuredReplyToMode = resolveSlackAccount({
        cfg: params.cfg,
        accountId: params.accountId,
    }).replyToMode ?? "off";
    const effectiveReplyToMode = params.context.ThreadLabel ? "all" : configuredReplyToMode;
    const threadId = params.context.MessageThreadId ?? params.context.ReplyToId;
    return {
        currentChannelId: params.context.To?.startsWith("channel:")
            ? params.context.To.slice("channel:".length)
            : undefined,
        currentThreadTs: threadId != null ? String(threadId) : undefined,
        replyToMode: effectiveReplyToMode,
        hasRepliedRef: params.hasRepliedRef,
    };
}
