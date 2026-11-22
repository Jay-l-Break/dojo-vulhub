import { WebSocketServer } from "ws";
import { CANVAS_HOST_PATH } from "../canvas-host/a2ui.js";
import { createCanvasHostHandler } from "../canvas-host/server.js";
import { createGatewayHooksRequestHandler } from "./server/hooks.js";
import { listenGatewayHttpServer } from "./server/http-listen.js";
import { createGatewayPluginRequestHandler } from "./server/plugins-http.js";
import { createGatewayBroadcaster } from "./server-broadcast.js";
import { createChatRunState } from "./server-chat.js";
import { MAX_PAYLOAD_BYTES } from "./server-constants.js";
import { attachGatewayUpgradeHandler, createGatewayHttpServer } from "./server-http.js";
export async function createGatewayRuntimeState(params) {
    let canvasHost = null;
    if (params.canvasHostEnabled) {
        try {
            const handler = await createCanvasHostHandler({
                runtime: params.canvasRuntime,
                rootDir: params.cfg.canvasHost?.root,
                basePath: CANVAS_HOST_PATH,
                allowInTests: params.allowCanvasHostInTests,
                liveReload: params.cfg.canvasHost?.liveReload,
            });
            if (handler.rootDir) {
                canvasHost = handler;
                params.logCanvas.info(`canvas host mounted at http://${params.bindHost}:${params.port}${CANVAS_HOST_PATH}/ (root ${handler.rootDir})`);
            }
        }
        catch (err) {
            params.logCanvas.warn(`canvas host failed to start: ${String(err)}`);
        }
    }
    const handleHooksRequest = createGatewayHooksRequestHandler({
        deps: params.deps,
        getHooksConfig: params.hooksConfig,
        bindHost: params.bindHost,
        port: params.port,
        logHooks: params.logHooks,
    });
    const handlePluginRequest = createGatewayPluginRequestHandler({
        registry: params.pluginRegistry,
        log: params.logPlugins,
    });
    const httpServer = createGatewayHttpServer({
        canvasHost,
        controlUiEnabled: params.controlUiEnabled,
        controlUiBasePath: params.controlUiBasePath,
        openAiChatCompletionsEnabled: params.openAiChatCompletionsEnabled,
        openResponsesEnabled: params.openResponsesEnabled,
        openResponsesConfig: params.openResponsesConfig,
        handleHooksRequest,
        handlePluginRequest,
        resolvedAuth: params.resolvedAuth,
        tlsOptions: params.gatewayTls?.enabled ? params.gatewayTls.tlsOptions : undefined,
    });
    await listenGatewayHttpServer({
        httpServer,
        bindHost: params.bindHost,
        port: params.port,
    });
    const wss = new WebSocketServer({
        noServer: true,
        maxPayload: MAX_PAYLOAD_BYTES,
    });
    attachGatewayUpgradeHandler({ httpServer, wss, canvasHost });
    const clients = new Set();
    const { broadcast } = createGatewayBroadcaster({ clients });
    const agentRunSeq = new Map();
    const dedupe = new Map();
    const chatRunState = createChatRunState();
    const chatRunRegistry = chatRunState.registry;
    const chatRunBuffers = chatRunState.buffers;
    const chatDeltaSentAt = chatRunState.deltaSentAt;
    const addChatRun = chatRunRegistry.add;
    const removeChatRun = chatRunRegistry.remove;
    const chatAbortControllers = new Map();
    return {
        canvasHost,
        httpServer,
        wss,
        clients,
        broadcast,
        agentRunSeq,
        dedupe,
        chatRunState,
        chatRunBuffers,
        chatDeltaSentAt,
        addChatRun,
        removeChatRun,
        chatAbortControllers,
    };
}
