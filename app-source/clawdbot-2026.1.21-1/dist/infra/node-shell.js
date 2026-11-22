export function buildNodeShellCommand(command, platform) {
    const normalized = String(platform ?? "")
        .trim()
        .toLowerCase();
    if (normalized.includes("win")) {
        return ["cmd.exe", "/d", "/s", "/c", command];
    }
    return ["/bin/sh", "-lc", command];
}
