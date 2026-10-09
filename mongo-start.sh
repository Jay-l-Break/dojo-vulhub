#!/bin/bash
set -euo pipefail

mongod --replSet rs0 --oplogSize 128 --bind_ip_all &
mongo_pid=$!
for attempt in $(seq 1 60); do
  if mongo --quiet --eval 'db.adminCommand({ping: 1}).ok' 2>/dev/null | grep -q 1; then
    break
  fi
  sleep 1
done
mongo --quiet --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})' || true
wait "$mongo_pid"
