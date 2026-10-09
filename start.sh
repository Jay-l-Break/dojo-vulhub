#!/usr/bin/env bash
set -euo pipefail

airflow initdb
python /opt/airflow/create_user.py
exec /home/airflow/.local/bin/gunicorn -w 2 -b 0.0.0.0:80 --access-logfile - --error-logfile - 'airflow.www.app:cached_app()'
