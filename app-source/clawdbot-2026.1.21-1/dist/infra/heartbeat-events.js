let lastHeartbeat = null;
const listeners = new Set();
export function emitHeartbeatEvent(evt) {
    const enriched = { ts: Date.now(), ...evt };
    lastHeartbeat = enriched;
    for (const listener of listeners) {
        try {
            listener(enriched);
        }
        catch {
            /* ignore */
        }
    }
}
export function onHeartbeatEvent(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
export function getLastHeartbeatEvent() {
    return lastHeartbeat;
}
