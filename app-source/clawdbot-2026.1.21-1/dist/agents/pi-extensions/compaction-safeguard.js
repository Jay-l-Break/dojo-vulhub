import { estimateTokens, generateSummary } from "@mariozechner/pi-coding-agent";
import { DEFAULT_CONTEXT_TOKENS } from "../defaults.js";
const MAX_CHUNK_RATIO = 0.4;
const FALLBACK_SUMMARY = "Summary unavailable due to context limits. Older messages were truncated.";
const TURN_PREFIX_INSTRUCTIONS = "This summary covers the prefix of a split turn. Focus on the original request," +
    " early progress, and any details needed to understand the retained suffix.";
const MAX_TOOL_FAILURES = 8;
const MAX_TOOL_FAILURE_CHARS = 240;
function normalizeFailureText(text) {
    return text.replace(/\s+/g, " ").trim();
}
function truncateFailureText(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}
function formatToolFailureMeta(details) {
    if (!details || typeof details !== "object")
        return undefined;
    const record = details;
    const status = typeof record.status === "string" ? record.status : undefined;
    const exitCode = typeof record.exitCode === "number" && Number.isFinite(record.exitCode)
        ? record.exitCode
        : undefined;
    const parts = [];
    if (status)
        parts.push(`status=${status}`);
    if (exitCode !== undefined)
        parts.push(`exitCode=${exitCode}`);
    return parts.length > 0 ? parts.join(" ") : undefined;
}
function extractToolResultText(content) {
    if (!Array.isArray(content))
        return "";
    const parts = [];
    for (const block of content) {
        if (!block || typeof block !== "object")
            continue;
        const rec = block;
        if (rec.type === "text" && typeof rec.text === "string") {
            parts.push(rec.text);
        }
    }
    return parts.join("\n");
}
function collectToolFailures(messages) {
    const failures = [];
    const seen = new Set();
    for (const message of messages) {
        if (!message || typeof message !== "object")
            continue;
        const role = message.role;
        if (role !== "toolResult")
            continue;
        const toolResult = message;
        if (toolResult.isError !== true)
            continue;
        const toolCallId = typeof toolResult.toolCallId === "string" ? toolResult.toolCallId : "";
        if (!toolCallId || seen.has(toolCallId))
            continue;
        seen.add(toolCallId);
        const toolName = typeof toolResult.toolName === "string" && toolResult.toolName.trim()
            ? toolResult.toolName
            : "tool";
        const rawText = extractToolResultText(toolResult.content);
        const meta = formatToolFailureMeta(toolResult.details);
        const normalized = normalizeFailureText(rawText);
        const summary = truncateFailureText(normalized || (meta ? "failed" : "failed (no output)"), MAX_TOOL_FAILURE_CHARS);
        failures.push({ toolCallId, toolName, summary, meta });
    }
    return failures;
}
function formatToolFailuresSection(failures) {
    if (failures.length === 0)
        return "";
    const lines = failures.slice(0, MAX_TOOL_FAILURES).map((failure) => {
        const meta = failure.meta ? ` (${failure.meta})` : "";
        return `- ${failure.toolName}${meta}: ${failure.summary}`;
    });
    if (failures.length > MAX_TOOL_FAILURES) {
        lines.push(`- ...and ${failures.length - MAX_TOOL_FAILURES} more`);
    }
    return `\n\n## Tool Failures\n${lines.join("\n")}`;
}
function computeFileLists(fileOps) {
    const modified = new Set([...fileOps.edited, ...fileOps.written]);
    const readFiles = [...fileOps.read].filter((f) => !modified.has(f)).sort();
    const modifiedFiles = [...modified].sort();
    return { readFiles, modifiedFiles };
}
function formatFileOperations(readFiles, modifiedFiles) {
    const sections = [];
    if (readFiles.length > 0) {
        sections.push(`<read-files>\n${readFiles.join("\n")}\n</read-files>`);
    }
    if (modifiedFiles.length > 0) {
        sections.push(`<modified-files>\n${modifiedFiles.join("\n")}\n</modified-files>`);
    }
    if (sections.length === 0)
        return "";
    return `\n\n${sections.join("\n\n")}`;
}
function chunkMessages(messages, maxTokens) {
    if (messages.length === 0)
        return [];
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    for (const message of messages) {
        const messageTokens = estimateTokens(message);
        if (currentChunk.length > 0 && currentTokens + messageTokens > maxTokens) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentTokens = 0;
        }
        currentChunk.push(message);
        currentTokens += messageTokens;
        if (messageTokens > maxTokens) {
            // Split oversized messages to avoid unbounded chunk growth.
            chunks.push(currentChunk);
            currentChunk = [];
            currentTokens = 0;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    return chunks;
}
async function summarizeChunks(params) {
    if (params.messages.length === 0) {
        return params.previousSummary ?? "No prior history.";
    }
    const chunks = chunkMessages(params.messages, params.maxChunkTokens);
    let summary = params.previousSummary;
    for (const chunk of chunks) {
        summary = await generateSummary(chunk, params.model, params.reserveTokens, params.apiKey, params.signal, params.customInstructions, summary);
    }
    return summary ?? "No prior history.";
}
export default function compactionSafeguardExtension(api) {
    api.on("session_before_compact", async (event, ctx) => {
        const { preparation, customInstructions, signal } = event;
        const { readFiles, modifiedFiles } = computeFileLists(preparation.fileOps);
        const fileOpsSummary = formatFileOperations(readFiles, modifiedFiles);
        const toolFailures = collectToolFailures([
            ...preparation.messagesToSummarize,
            ...preparation.turnPrefixMessages,
        ]);
        const toolFailureSection = formatToolFailuresSection(toolFailures);
        const fallbackSummary = `${FALLBACK_SUMMARY}${toolFailureSection}${fileOpsSummary}`;
        const model = ctx.model;
        if (!model) {
            return {
                compaction: {
                    summary: fallbackSummary,
                    firstKeptEntryId: preparation.firstKeptEntryId,
                    tokensBefore: preparation.tokensBefore,
                    details: { readFiles, modifiedFiles },
                },
            };
        }
        const apiKey = await ctx.modelRegistry.getApiKey(model);
        if (!apiKey) {
            return {
                compaction: {
                    summary: fallbackSummary,
                    firstKeptEntryId: preparation.firstKeptEntryId,
                    tokensBefore: preparation.tokensBefore,
                    details: { readFiles, modifiedFiles },
                },
            };
        }
        try {
            const contextWindowTokens = Math.max(1, Math.floor(model.contextWindow ?? DEFAULT_CONTEXT_TOKENS));
            const maxChunkTokens = Math.max(1, Math.floor(contextWindowTokens * MAX_CHUNK_RATIO));
            const reserveTokens = Math.max(1, Math.floor(preparation.settings.reserveTokens));
            const historySummary = await summarizeChunks({
                messages: preparation.messagesToSummarize,
                model,
                apiKey,
                signal,
                reserveTokens,
                maxChunkTokens,
                customInstructions,
                previousSummary: preparation.previousSummary,
            });
            let summary = historySummary;
            if (preparation.isSplitTurn && preparation.turnPrefixMessages.length > 0) {
                const prefixSummary = await summarizeChunks({
                    messages: preparation.turnPrefixMessages,
                    model,
                    apiKey,
                    signal,
                    reserveTokens,
                    maxChunkTokens,
                    customInstructions: TURN_PREFIX_INSTRUCTIONS,
                });
                summary = `${historySummary}\n\n---\n\n**Turn Context (split turn):**\n\n${prefixSummary}`;
            }
            summary += toolFailureSection;
            summary += fileOpsSummary;
            return {
                compaction: {
                    summary,
                    firstKeptEntryId: preparation.firstKeptEntryId,
                    tokensBefore: preparation.tokensBefore,
                    details: { readFiles, modifiedFiles },
                },
            };
        }
        catch (error) {
            console.warn(`Compaction summarization failed; truncating history: ${error instanceof Error ? error.message : String(error)}`);
            return {
                compaction: {
                    summary: fallbackSummary,
                    firstKeptEntryId: preparation.firstKeptEntryId,
                    tokensBefore: preparation.tokensBefore,
                    details: { readFiles, modifiedFiles },
                },
            };
        }
    });
}
export const __testing = {
    collectToolFailures,
    formatToolFailuresSection,
};
