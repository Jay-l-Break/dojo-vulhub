#!/bin/sh
set -eu

if [ -z "${PGADMIN_DEFAULT_PASSWORD:-}" ]; then
    PGADMIN_DEFAULT_PASSWORD="$(head -c 24 /dev/urandom | base64 | tr -d '\n')"
    export PGADMIN_DEFAULT_PASSWORD
fi

exec /entrypoint.sh "$@"
