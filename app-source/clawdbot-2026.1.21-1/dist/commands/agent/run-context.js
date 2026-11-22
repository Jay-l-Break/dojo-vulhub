import { normalizeAccountId } from "../../utils/account-id.js";
import { resolveMessageChannel } from "../../utils/message-channel.js";
export function resolveAgentRunContext(opts) {
    const merged = opts.runContext ? { ...opts.runContext } : {};
    const normalizedChannel = resolveMessageChannel(merged.messageChannel ?? opts.messageChannel, opts.replyChannel ?? opts.channel);
    if (normalizedChannel)
        merged.messageChannel = normalizedChannel;
    const normalizedAccountId = normalizeAccountId(merged.accountId ?? opts.accountId);
    if (normalizedAccountId)
        merged.accountId = normalizedAccountId;
    if (merged.currentThreadTs == null &&
        opts.threadId != null &&
        opts.threadId !== "" &&
        opts.threadId !== null) {
        merged.currentThreadTs = String(opts.threadId);
    }
    return merged;
}
