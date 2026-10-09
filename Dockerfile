FROM node:14-bullseye

RUN sed -i '/debian-security/d; /bullseye-updates/d' /etc/apt/sources.list \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends mariadb-server \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server
COPY app/server/package.json app/server/package-lock.json ./
RUN npm ci --omit=dev
COPY app/server/ ./
COPY start.js /app/start.js
COPY start.sh /app/start.sh

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
CMD ["sh", "/app/start.sh"]
