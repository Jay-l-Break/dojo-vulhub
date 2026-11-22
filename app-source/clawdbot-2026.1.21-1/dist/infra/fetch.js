export function wrapFetchWithAbortSignal(fetchImpl) {
    const wrapped = ((input, init) => {
        const signal = init?.signal;
        if (!signal)
            return fetchImpl(input, init);
        if (typeof AbortSignal !== "undefined" && signal instanceof AbortSignal) {
            return fetchImpl(input, init);
        }
        if (typeof AbortController === "undefined") {
            return fetchImpl(input, init);
        }
        if (typeof signal.addEventListener !== "function") {
            return fetchImpl(input, init);
        }
        const controller = new AbortController();
        const onAbort = () => controller.abort();
        if (signal.aborted) {
            controller.abort();
        }
        else {
            signal.addEventListener("abort", onAbort, { once: true });
        }
        const response = fetchImpl(input, { ...init, signal: controller.signal });
        if (typeof signal.removeEventListener === "function") {
            void response.finally(() => {
                signal.removeEventListener("abort", onAbort);
            });
        }
        return response;
    });
    const fetchWithPreconnect = fetchImpl;
    wrapped.preconnect =
        typeof fetchWithPreconnect.preconnect === "function"
            ? fetchWithPreconnect.preconnect.bind(fetchWithPreconnect)
            : () => { };
    return Object.assign(wrapped, fetchImpl);
}
export function resolveFetch(fetchImpl) {
    const resolved = fetchImpl ?? globalThis.fetch;
    if (!resolved)
        return undefined;
    return wrapFetchWithAbortSignal(resolved);
}
