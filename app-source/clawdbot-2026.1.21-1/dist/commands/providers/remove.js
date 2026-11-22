import { writeConfigFile } from "../../config/config.js";
import { listDiscordAccountIds } from "../../discord/accounts.js";
import { listIMessageAccountIds } from "../../imessage/accounts.js";
import { listChatProviders, normalizeChatProviderId, } from "../../providers/registry.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId, } from "../../routing/session-key.js";
import { defaultRuntime } from "../../runtime.js";
import { listSignalAccountIds } from "../../signal/accounts.js";
import { listSlackAccountIds } from "../../slack/accounts.js";
import { listTelegramAccountIds } from "../../telegram/accounts.js";
import { listWhatsAppAccountIds } from "../../web/accounts.js";
import { createClackPrompter } from "../../wizard/clack-prompter.js";
import { providerLabel, requireValidConfig, shouldUseWizard, } from "./shared.js";
function listAccountIds(cfg, provider) {
    switch (provider) {
        case "whatsapp":
            return listWhatsAppAccountIds(cfg);
        case "telegram":
            return listTelegramAccountIds(cfg);
        case "discord":
            return listDiscordAccountIds(cfg);
        case "slack":
            return listSlackAccountIds(cfg);
        case "signal":
            return listSignalAccountIds(cfg);
        case "imessage":
            return listIMessageAccountIds(cfg);
    }
}
export async function providersRemoveCommand(opts, runtime = defaultRuntime, params) {
    const cfg = await requireValidConfig(runtime);
    if (!cfg)
        return;
    const useWizard = shouldUseWizard(params);
    const prompter = useWizard ? createClackPrompter() : null;
    let provider = normalizeChatProviderId(opts.provider);
    let accountId = normalizeAccountId(opts.account);
    const deleteConfig = Boolean(opts.delete);
    if (useWizard && prompter) {
        await prompter.intro("Remove provider account");
        provider = (await prompter.select({
            message: "Provider",
            options: listChatProviders().map((meta) => ({
                value: meta.id,
                label: meta.label,
            })),
        }));
        accountId = await (async () => {
            const ids = listAccountIds(cfg, provider);
            const choice = (await prompter.select({
                message: "Account",
                options: ids.map((id) => ({
                    value: id,
                    label: id === DEFAULT_ACCOUNT_ID ? "default (primary)" : id,
                })),
                initialValue: ids[0] ?? DEFAULT_ACCOUNT_ID,
            }));
            return normalizeAccountId(choice);
        })();
        const wantsDisable = await prompter.confirm({
            message: `Disable ${providerLabel(provider)} account "${accountId}"? (keeps config)`,
            initialValue: true,
        });
        if (!wantsDisable) {
            await prompter.outro("Cancelled.");
            return;
        }
    }
    else {
        if (!provider) {
            runtime.error("Provider is required. Use --provider <name>.");
            runtime.exit(1);
            return;
        }
        if (!deleteConfig) {
            const confirm = createClackPrompter();
            const ok = await confirm.confirm({
                message: `Disable ${providerLabel(provider)} account "${accountId}"? (keeps config)`,
                initialValue: true,
            });
            if (!ok) {
                return;
            }
        }
    }
    let next = { ...cfg };
    const accountKey = accountId || DEFAULT_ACCOUNT_ID;
    const setAccountEnabled = (key, enabled) => {
        if (key === "whatsapp") {
            next = {
                ...next,
                whatsapp: {
                    ...next.whatsapp,
                    accounts: {
                        ...next.whatsapp?.accounts,
                        [accountKey]: {
                            ...next.whatsapp?.accounts?.[accountKey],
                            enabled,
                        },
                    },
                },
            };
            return;
        }
        const base = next[key];
        const baseAccounts = base?.accounts ?? {};
        const existingAccount = baseAccounts[accountKey] ?? {};
        if (accountKey === DEFAULT_ACCOUNT_ID && !base?.accounts) {
            next = {
                ...next,
                [key]: {
                    ...base,
                    enabled,
                },
            };
            return;
        }
        next = {
            ...next,
            [key]: {
                ...base,
                accounts: {
                    ...baseAccounts,
                    [accountKey]: {
                        ...existingAccount,
                        enabled,
                    },
                },
            },
        };
    };
    const deleteAccount = (key) => {
        if (key === "whatsapp") {
            const accounts = { ...next.whatsapp?.accounts };
            delete accounts[accountKey];
            next = {
                ...next,
                whatsapp: {
                    ...next.whatsapp,
                    accounts: Object.keys(accounts).length ? accounts : undefined,
                },
            };
            return;
        }
        const base = next[key];
        if (accountKey !== DEFAULT_ACCOUNT_ID) {
            const accounts = { ...base?.accounts };
            delete accounts[accountKey];
            next = {
                ...next,
                [key]: {
                    ...base,
                    accounts: Object.keys(accounts).length ? accounts : undefined,
                },
            };
            return;
        }
        if (base?.accounts && Object.keys(base.accounts).length > 0) {
            const accounts = { ...base.accounts };
            delete accounts[accountKey];
            next = {
                ...next,
                [key]: {
                    ...base,
                    accounts: Object.keys(accounts).length ? accounts : undefined,
                    ...(key === "telegram"
                        ? { botToken: undefined, tokenFile: undefined, name: undefined }
                        : key === "discord"
                            ? { token: undefined, name: undefined }
                            : key === "slack"
                                ? { botToken: undefined, appToken: undefined, name: undefined }
                                : key === "signal"
                                    ? {
                                        account: undefined,
                                        httpUrl: undefined,
                                        httpHost: undefined,
                                        httpPort: undefined,
                                        cliPath: undefined,
                                        name: undefined,
                                    }
                                    : key === "imessage"
                                        ? {
                                            cliPath: undefined,
                                            dbPath: undefined,
                                            service: undefined,
                                            region: undefined,
                                            name: undefined,
                                        }
                                        : {}),
                },
            };
            return;
        }
        // No accounts map: remove entire provider section.
        const clone = { ...next };
        delete clone[key];
        next = clone;
    };
    if (deleteConfig) {
        deleteAccount(provider);
    }
    else {
        setAccountEnabled(provider, false);
    }
    await writeConfigFile(next);
    if (useWizard && prompter) {
        await prompter.outro(deleteConfig
            ? `Deleted ${providerLabel(provider)} account "${accountKey}".`
            : `Disabled ${providerLabel(provider)} account "${accountKey}".`);
    }
    else {
        runtime.log(deleteConfig
            ? `Deleted ${providerLabel(provider)} account "${accountKey}".`
            : `Disabled ${providerLabel(provider)} account "${accountKey}".`);
    }
}
