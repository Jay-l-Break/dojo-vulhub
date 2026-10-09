FROM mongo:4.0@sha256:4ca81c89ad08f4cfa9906005126112bffe8fb363800466ef5e50f6238f6f6af1 AS mongo

FROM vulhub/yapi:1.9.2@sha256:cc2c74829b6a21307e1a4904855436a631145283947c329f40269df0bf829df1
RUN sed -i 's|deb.debian.org/debian|archive.debian.org/debian|g;s|security.debian.org/debian-security|archive.debian.org/debian-security|g;/buster-updates/d' /etc/apt/sources.list \
    && apt-get -o Acquire::Check-Valid-Until=false update -qq \
    && apt-get install -y -qq --no-install-recommends libcurl4 libssl1.1 libldap-2.4-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=mongo /usr/bin/mongod /usr/local/bin/mongod
COPY --from=mongo /lib/x86_64-linux-gnu/libcrypto.so.1.0.0 /opt/mongo/lib/libcrypto.so.1.0.0
COPY --from=mongo /lib/x86_64-linux-gnu/libssl.so.1.0.0 /opt/mongo/lib/libssl.so.1.0.0
COPY --from=mongo /usr/lib/x86_64-linux-gnu/libcurl.so.4.4.0 /opt/mongo/lib/libcurl.so.4
COPY --from=mongo /usr/lib/x86_64-linux-gnu/libidn.so.11.6.15 /opt/mongo/lib/libidn.so.11
WORKDIR /usr/src
RUN node -e 'const fs = require("fs"); fs.readdirSync("/usr/src").forEach((name) => fs.rmSync("/usr/src/" + name, {recursive: true, force: true}))'
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps --no-audit --no-fund
COPY . .
EXPOSE 80
COPY --chmod=755 local-entrypoint.sh /usr/local/bin/local-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/local-entrypoint.sh"]
