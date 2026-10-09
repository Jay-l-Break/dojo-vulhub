#!/bin/sh
set -eu

if [ -z "${PGADMIN_DEFAULT_EMAIL:-}" ]; then
    PGADMIN_DEFAULT_EMAIL=local@example.com
    export PGADMIN_DEFAULT_EMAIL
fi
if [ -z "${PGADMIN_DEFAULT_PASSWORD:-}" ] && [ -z "${PGADMIN_DEFAULT_PASSWORD_FILE:-}" ]; then
    PGADMIN_DEFAULT_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')"
    export PGADMIN_DEFAULT_PASSWORD
fi
exec /entrypoint.sh "$@"
