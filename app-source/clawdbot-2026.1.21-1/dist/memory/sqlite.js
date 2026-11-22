import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export function requireNodeSqlite() {
    const onWarning = (warning) => {
        if (warning.name === "ExperimentalWarning" &&
            warning.message?.includes("SQLite is an experimental feature")) {
            return;
        }
        process.stderr.write(`${warning.stack ?? warning.toString()}\n`);
    };
    process.on("warning", onWarning);
    try {
        return require("node:sqlite");
    }
    finally {
        process.off("warning", onWarning);
    }
}
