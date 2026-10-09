FROM node:22-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates chromium curl git socat && \
    rm -rf /var/lib/apt/lists/*

COPY vendor/clawdbot-2026.1.21-1.tgz /tmp/clawdbot.tgz
RUN npm install -g /tmp/clawdbot.tgz && rm /tmp/clawdbot.tgz

COPY entrypoint.sh /app/entrypoint.sh
COPY victim-browser.mjs /app/victim-browser.mjs
RUN chmod +x /app/entrypoint.sh

EXPOSE 80 18791
ENTRYPOINT ["/app/entrypoint.sh"]
