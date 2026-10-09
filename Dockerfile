FROM node:20-slim@sha256:2cf067cfed83d5ea958367df9f966191a942351a2df77d6f0193e162b5febfc0 AS build

WORKDIR /build
RUN npm install --no-audit --no-fund typescript@5.5.4
COPY packages/nodes-base/nodes/Form/utils.ts ./utils.ts
RUN node -e 'const fs = require("fs"); const ts = require("typescript"); const source = fs.readFileSync("utils.ts", "utf8"); const result = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, esModuleInterop: true}}); fs.writeFileSync("utils.js", result.outputText);'

FROM n8nio/n8n:1.53.0@sha256:260d13f316cdba6ef043d9e473d082705bba5c3ab235b633808b563c59196148

USER root
RUN apk add --no-cache bash curl jq

COPY --from=build /build/utils.js /usr/local/lib/node_modules/n8n/node_modules/n8n-nodes-base/dist/nodes/Form/utils.js

COPY seed_public /opt/n8n/seed_public

ENV N8N_PORT=80 N8N_SECURE_COOKIE=false N8N_DIAGNOSTICS_ENABLED=false
EXPOSE 80
ENTRYPOINT ["/bin/bash", "/opt/n8n/seed_public/init.sh"]
