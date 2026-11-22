import { chunkText } from "../../auto-reply/chunk.js";
import { sendMessageIMessage } from "../send.js";
export async function deliverReplies(params) {
    const { replies, target, client, runtime, maxBytes, textLimit, accountId } = params;
    for (const payload of replies) {
        const mediaList = payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : []);
        const text = payload.text ?? "";
        if (!text && mediaList.length === 0)
            continue;
        if (mediaList.length === 0) {
            for (const chunk of chunkText(text, textLimit)) {
                await sendMessageIMessage(target, chunk, {
                    maxBytes,
                    client,
                    accountId,
                });
            }
        }
        else {
            let first = true;
            for (const url of mediaList) {
                const caption = first ? text : "";
                first = false;
                await sendMessageIMessage(target, caption, {
                    mediaUrl: url,
                    maxBytes,
                    client,
                    accountId,
                });
            }
        }
        runtime.log?.(`imessage: delivered reply to ${target}`);
    }
}
