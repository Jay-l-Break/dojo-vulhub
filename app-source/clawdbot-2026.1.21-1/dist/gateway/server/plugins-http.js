export function createGatewayPluginRequestHandler(params) {
    const { registry, log } = params;
    return async (req, res) => {
        if (registry.httpHandlers.length === 0)
            return false;
        for (const entry of registry.httpHandlers) {
            try {
                const handled = await entry.handler(req, res);
                if (handled)
                    return true;
            }
            catch (err) {
                log.warn(`plugin http handler failed (${entry.pluginId}): ${String(err)}`);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "text/plain; charset=utf-8");
                    res.end("Internal Server Error");
                }
                return true;
            }
        }
        return false;
    };
}
