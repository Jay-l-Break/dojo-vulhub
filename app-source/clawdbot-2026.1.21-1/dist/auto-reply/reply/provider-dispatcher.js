import { dispatchReplyFromConfig } from "./dispatch-from-config.js";
import { createReplyDispatcher, createReplyDispatcherWithTyping, } from "./reply-dispatcher.js";
export async function dispatchReplyWithBufferedBlockDispatcher(params) {
    const { dispatcher, replyOptions, markDispatchIdle } = createReplyDispatcherWithTyping(params.dispatcherOptions);
    const result = await dispatchReplyFromConfig({
        ctx: params.ctx,
        cfg: params.cfg,
        dispatcher,
        replyResolver: params.replyResolver,
        replyOptions: {
            ...params.replyOptions,
            ...replyOptions,
        },
    });
    markDispatchIdle();
    return result;
}
export async function dispatchReplyWithDispatcher(params) {
    const dispatcher = createReplyDispatcher(params.dispatcherOptions);
    const result = await dispatchReplyFromConfig({
        ctx: params.ctx,
        cfg: params.cfg,
        dispatcher,
        replyResolver: params.replyResolver,
        replyOptions: params.replyOptions,
    });
    await dispatcher.waitForIdle();
    return result;
}
