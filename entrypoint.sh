#!/bin/bash
set -euo pipefail

rm -f /tmp/django004-ready
if [[ -n "${DB_PASSWORD:-}" ]]; then
  python /app/seed_database.py &
fi
exec python /app/serve.py
