#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${AIRFLOW__CORE__SQL_ALCHEMY_CONN:-}" ]]; then
  export AIRFLOW__CORE__EXECUTOR=SequentialExecutor
  export AIRFLOW__CORE__SQL_ALCHEMY_CONN=sqlite:////opt/airflow/airflow.db
fi

airflow initdb
if [[ "${AIRFLOW__CORE__EXECUTOR}" == "CeleryExecutor" ]]; then
  airflow worker &
  sleep 3
fi
exec /home/airflow/.local/bin/gunicorn -w 2 -b 0.0.0.0:80 --access-logfile - --error-logfile - 'airflow.www.app:cached_app()'
