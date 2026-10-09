FROM node:20-slim@sha256:2cf067cfed83d5ea958367df9f966191a942351a2df77d6f0193e162b5febfc0 AS build

WORKDIR /build
RUN npm install --no-audit --no-fund typescript@3.3.3
COPY x-pack/plugins/upgrade_assistant/server/lib/telemetry/usage_collector.ts ./usage_collector.ts
RUN node -e 'const fs = require("fs"); const ts = require("typescript"); const source = fs.readFileSync("usage_collector.ts", "utf8"); const result = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018}}); fs.writeFileSync("usage_collector.js", result.outputText);'

FROM docker.elastic.co/kibana/kibana:6.7.0@sha256:84718c5dfaad5cd8949f2c8129d033730218f7af4f3ffd15acdb2e84b523caab

COPY --from=build --chown=kibana:kibana /build/usage_collector.js /usr/share/kibana/node_modules/x-pack/plugins/upgrade_assistant/server/lib/telemetry/usage_collector.js

ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=80
EXPOSE 80
