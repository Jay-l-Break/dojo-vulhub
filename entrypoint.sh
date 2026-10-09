#!/bin/sh
set -eu

/app/.venv/bin/python /app/seed_public.py &
exec /app/.venv/bin/langflow run --host 0.0.0.0 --port 80
