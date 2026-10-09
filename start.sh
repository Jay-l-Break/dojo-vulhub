#!/usr/bin/env bash
set -euo pipefail

mkdir -p /opt/airflow/challenge_dags
cp /opt/airflow-source/airflow/example_dags/example_trigger_target_dag.py /opt/airflow/challenge_dags/
airflow initdb
airflow unpause example_trigger_target_dag
airflow scheduler &
exec /home/airflow/.local/bin/gunicorn -w 2 -b 0.0.0.0:80 --access-logfile - --error-logfile - 'airflow.www.app:cached_app()'
