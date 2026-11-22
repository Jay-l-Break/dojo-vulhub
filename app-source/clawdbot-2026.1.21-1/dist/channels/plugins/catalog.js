import path from "node:path";
import { discoverClawdbotPlugins } from "../../plugins/discovery.js";
const ORIGIN_PRIORITY = {
    config: 0,
    workspace: 1,
    global: 2,
    bundled: 3,
};
function toChannelMeta(params) {
    const label = params.channel.label?.trim();
    if (!label)
        return null;
    const selectionLabel = params.channel.selectionLabel?.trim() || label;
    const detailLabel = params.channel.detailLabel?.trim();
    const docsPath = params.channel.docsPath?.trim() || `/channels/${params.id}`;
    const blurb = params.channel.blurb?.trim() || "";
    const systemImage = params.channel.systemImage?.trim();
    return {
        id: params.id,
        label,
        selectionLabel,
        ...(detailLabel ? { detailLabel } : {}),
        docsPath,
        docsLabel: params.channel.docsLabel?.trim() || undefined,
        blurb,
        ...(params.channel.aliases ? { aliases: params.channel.aliases } : {}),
        ...(params.channel.preferOver ? { preferOver: params.channel.preferOver } : {}),
        ...(params.channel.order !== undefined ? { order: params.channel.order } : {}),
        ...(params.channel.selectionDocsPrefix
            ? { selectionDocsPrefix: params.channel.selectionDocsPrefix }
            : {}),
        ...(params.channel.selectionDocsOmitLabel !== undefined
            ? { selectionDocsOmitLabel: params.channel.selectionDocsOmitLabel }
            : {}),
        ...(params.channel.selectionExtras ? { selectionExtras: params.channel.selectionExtras } : {}),
        ...(systemImage ? { systemImage } : {}),
        ...(params.channel.showConfigured !== undefined
            ? { showConfigured: params.channel.showConfigured }
            : {}),
        ...(params.channel.quickstartAllowFrom !== undefined
            ? { quickstartAllowFrom: params.channel.quickstartAllowFrom }
            : {}),
        ...(params.channel.forceAccountBinding !== undefined
            ? { forceAccountBinding: params.channel.forceAccountBinding }
            : {}),
        ...(params.channel.preferSessionLookupForAnnounceTarget !== undefined
            ? {
                preferSessionLookupForAnnounceTarget: params.channel.preferSessionLookupForAnnounceTarget,
            }
            : {}),
    };
}
function resolveInstallInfo(params) {
    const npmSpec = params.manifest.install?.npmSpec?.trim() ?? params.packageName?.trim();
    if (!npmSpec)
        return null;
    let localPath = params.manifest.install?.localPath?.trim() || undefined;
    if (!localPath && params.workspaceDir && params.packageDir) {
        localPath = path.relative(params.workspaceDir, params.packageDir) || undefined;
    }
    const defaultChoice = params.manifest.install?.defaultChoice ?? (localPath ? "local" : "npm");
    return {
        npmSpec,
        ...(localPath ? { localPath } : {}),
        ...(defaultChoice ? { defaultChoice } : {}),
    };
}
function buildCatalogEntry(candidate) {
    const manifest = candidate.packageClawdbot;
    if (!manifest?.channel)
        return null;
    const id = manifest.channel.id?.trim();
    if (!id)
        return null;
    const meta = toChannelMeta({ channel: manifest.channel, id });
    if (!meta)
        return null;
    const install = resolveInstallInfo({
        manifest,
        packageName: candidate.packageName,
        packageDir: candidate.packageDir,
        workspaceDir: candidate.workspaceDir,
    });
    if (!install)
        return null;
    return { id, meta, install };
}
export function buildChannelUiCatalog(plugins) {
    const entries = plugins.map((plugin) => {
        const detailLabel = plugin.meta.detailLabel ?? plugin.meta.selectionLabel ?? plugin.meta.label;
        return {
            id: plugin.id,
            label: plugin.meta.label,
            detailLabel,
            ...(plugin.meta.systemImage ? { systemImage: plugin.meta.systemImage } : {}),
        };
    });
    const order = entries.map((entry) => entry.id);
    const labels = {};
    const detailLabels = {};
    const systemImages = {};
    const byId = {};
    for (const entry of entries) {
        labels[entry.id] = entry.label;
        detailLabels[entry.id] = entry.detailLabel;
        if (entry.systemImage) {
            systemImages[entry.id] = entry.systemImage;
        }
        byId[entry.id] = entry;
    }
    return { entries, order, labels, detailLabels, systemImages, byId };
}
export function listChannelPluginCatalogEntries(options = {}) {
    const discovery = discoverClawdbotPlugins({ workspaceDir: options.workspaceDir });
    const resolved = new Map();
    for (const candidate of discovery.candidates) {
        const entry = buildCatalogEntry(candidate);
        if (!entry)
            continue;
        const priority = ORIGIN_PRIORITY[candidate.origin] ?? 99;
        const existing = resolved.get(entry.id);
        if (!existing || priority < existing.priority) {
            resolved.set(entry.id, { entry, priority });
        }
    }
    return Array.from(resolved.values())
        .map(({ entry }) => entry)
        .sort((a, b) => {
        const orderA = a.meta.order ?? 999;
        const orderB = b.meta.order ?? 999;
        if (orderA !== orderB)
            return orderA - orderB;
        return a.meta.label.localeCompare(b.meta.label);
    });
}
export function getChannelPluginCatalogEntry(id, options = {}) {
    const trimmed = id.trim();
    if (!trimmed)
        return undefined;
    return listChannelPluginCatalogEntries(options).find((entry) => entry.id === trimmed);
}
