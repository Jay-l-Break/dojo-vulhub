#!/bin/sh
set -eu

if [ -z "${MONGO_ADDR:-}" ]; then
    mkdir -p /tmp/dojo-mongodb
    LD_LIBRARY_PATH=/opt/mongo/lib mongod --dbpath /tmp/dojo-mongodb --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/dojo-mongodb/mongod.log
    MONGO_ADDR=localhost:27017
    export MONGO_ADDR
fi
exec node start.js
