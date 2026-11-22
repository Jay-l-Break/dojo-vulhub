export const createTestRegistry = (overrides = {}) => {
    const base = {
        plugins: [],
        tools: [],
        hooks: [],
        typedHooks: [],
        channels: [],
        providers: [],
        gatewayHandlers: {},
        httpHandlers: [],
        cliRegistrars: [],
        services: [],
        diagnostics: [],
    };
    const merged = { ...base, ...overrides };
    return {
        ...merged,
        gatewayHandlers: merged.gatewayHandlers ?? {},
        httpHandlers: merged.httpHandlers ?? [],
    };
};
