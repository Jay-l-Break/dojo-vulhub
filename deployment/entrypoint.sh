#!/usr/bin/env bash
set -euo pipefail

elasticsearch_url="${ELASTICSEARCH_HOSTS:-http://127.0.0.1:9200}"
telemetry_url="${elasticsearch_url%/}/.kibana_1/doc/upgrade-assistant-telemetry:upgrade-assistant-telemetry"

/usr/local/bin/kibana-docker &
kibana_pid=$!

while kill -0 "$kibana_pid" 2>/dev/null; do
  if curl --fail --silent --show-error --max-time 3 "$telemetry_url" 2>/dev/null | grep -q '"found":true'; then
    kill -TERM "$kibana_pid"
    wait "$kibana_pid" || true
    exec /usr/local/bin/kibana-docker
  fi
  sleep 2
done

wait "$kibana_pid"
