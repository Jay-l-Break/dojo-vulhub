#!/bin/bash
set -euo pipefail

if [[ -z "${CLAWDBOT_GATEWAY_TOKEN:-}" ]]; then
    CLAWDBOT_GATEWAY_TOKEN="$(node -e 'process.stdout.write(require("crypto").randomBytes(24).toString("hex"))')"
    export CLAWDBOT_GATEWAY_TOKEN
fi

mkdir -p /root/.clawdbot
cat > /root/.clawdbot/clawdbot.json <<EOF
{
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "port": 18790,
    "auth": {
      "mode": "token",
      "token": "$CLAWDBOT_GATEWAY_TOKEN"
    },
    "controlUi": {
      "allowInsecureAuth": true
    }
  }
}
EOF

node /usr/local/lib/node_modules/clawdbot/dist/index.js gateway --port 18790 --allow-unconfigured &
gateway_pid=$!

until curl -sf http://127.0.0.1:18790/healthz >/dev/null; do
    if ! kill -0 "$gateway_pid" 2>/dev/null; then
        wait "$gateway_pid"
    fi
    sleep 2
done

socat TCP-LISTEN:80,bind=0.0.0.0,reuseaddr,fork TCP:127.0.0.1:18790 &
node /app/victim-browser.mjs &
browser_pid=$!

wait -n "$gateway_pid" "$browser_pid"
