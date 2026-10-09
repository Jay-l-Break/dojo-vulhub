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

import pymysql

for attempt in range(60):
    try:
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user='root',
            password=os.environ['DB_PASSWORD'],
            database='cve',
            port=3306,
        )
        connection.close()
        break
    except pymysql.Error:
        time.sleep(1)
else:
    raise RuntimeError('database did not become ready')
PY

python app.py migrate --noinput
python seed_public.py
exec python app.py runserver 0.0.0.0:80
