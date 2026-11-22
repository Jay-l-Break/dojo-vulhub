import { parseBooleanValue } from "../utils/boolean.js";
export function normalizeZaiEnv() {
    if (!process.env.ZAI_API_KEY?.trim() && process.env.Z_AI_API_KEY?.trim()) {
        process.env.ZAI_API_KEY = process.env.Z_AI_API_KEY;
    }
}
export function isTruthyEnvValue(value) {
    return parseBooleanValue(value) === true;
}
export function normalizeEnv() {
    normalizeZaiEnv();
}
