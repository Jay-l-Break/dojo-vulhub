#!/bin/sh
set -eu

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -v password="$POSTGRES_PASSWORD" <<'SQL'
SET password_encryption = 'md5';
SELECT format('ALTER ROLE postgres PASSWORD %L', :'password') \gexec
SQL

touch /tmp/node-002-db-ready
