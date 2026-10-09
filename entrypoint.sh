#!/bin/bash
set -euo pipefail

if [[ -z "${DB_PASSWORD:-}" ]]; then
  python app.py migrate --noinput
  python seed_public.py
  exec python app.py runserver 0.0.0.0:80
fi

python - <<'PY'
import os
import time

import psycopg2

for attempt in range(60):
    try:
        connection = psycopg2.connect(
            dbname='CVE_2022_34265',
            user='postgres',
            password=os.environ['DB_PASSWORD'],
            host=os.getenv('DB_HOST', 'localhost'),
            port=5432,
        )
        connection.close()
        break
    except psycopg2.OperationalError:
        time.sleep(1)
else:
    raise RuntimeError('database did not become ready')
PY

python app.py migrate --noinput
python seed_public.py
exec python app.py runserver 0.0.0.0:80
