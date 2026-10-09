#!/bin/bash
set -euo pipefail

if [ -z "${VICTIM_PASSWORD_HASH:-}" ]; then
    VICTIM_PASSWORD_HASH="$(node -e 'const c=require("crypto");const b=require("/app/bundle/programs/server/npm/node_modules/bcrypt");console.log(b.hashSync(c.randomBytes(24).toString("hex"),12))')"
    export VICTIM_PASSWORD_HASH
    mkdir -p /tmp/dojo-mongodb
    LD_LIBRARY_PATH=/opt/mongo/lib mongod --dbpath /tmp/dojo-mongodb --bind_ip 127.0.0.1 --port 27017 --replSet rs0 --fork --logpath /tmp/dojo-mongodb/mongod.log
    LD_LIBRARY_PATH=/opt/mongo/lib mongo --quiet --host 127.0.0.1 --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
    for attempt in $(seq 1 30); do
        if LD_LIBRARY_PATH=/opt/mongo/lib mongo --quiet --host 127.0.0.1 --eval 'print(db.adminCommand({isMaster:1}).ismaster)' | grep -q true; then
            break
        fi
        sleep 1
    done
    MONGO_URL=mongodb://127.0.0.1:27017/rocketchat001
    export MONGO_URL
    MONGO_OPLOG_URL=mongodb://127.0.0.1:27017/local
    export MONGO_OPLOG_URL
    ROOT_URL=http://localhost
    export ROOT_URL
fi

node bridge.js &
bridge_pid=$!
node main.js &
app_pid=$!
wait -n "$bridge_pid" "$app_pid"
exit 1
