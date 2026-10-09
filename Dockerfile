FROM node:20-slim@sha256:2cf067cfed83d5ea958367df9f966191a942351a2df77d6f0193e162b5febfc0 AS build

WORKDIR /build
RUN npm install --no-audit --no-fund @babel/core@7.12.3 @babel/plugin-transform-modules-commonjs@7.12.1
COPY src/core_plugins/timelion/server/series_functions/props.js ./props.js
RUN node -e 'const fs = require("fs"); const babel = require("@babel/core"); const source = fs.readFileSync("props.js", "utf8"); const result = babel.transformSync(source, {babelrc: false, configFile: false, plugins: ["@babel/plugin-transform-modules-commonjs"]}); fs.writeFileSync("props.compiled.js", result.code + "\nmodule.exports = exports.default;\n");'

FROM docker.elastic.co/kibana/kibana:6.5.0@sha256:390d043692e64bfbc85d3cd547e3ff85f80506bb225e021e28e3a28a2688cfc4

COPY --from=build --chown=1000:0 /build/props.compiled.js /usr/share/kibana/src/core_plugins/timelion/server/series_functions/props.js

ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=80
EXPOSE 80
