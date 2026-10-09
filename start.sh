#!/bin/sh
set -eu

if [ -z "${CB_DB_HOST:-}" ]; then
  service mariadb start
  CB_DB_HOST=127.0.0.1
  CB_DB_NAME=chartbrew
  CB_DB_USERNAME=chartbrew
  CB_DB_PASSWORD="$(head -c 24 /dev/urandom | base64)"
  export CB_DB_HOST CB_DB_NAME CB_DB_USERNAME CB_DB_PASSWORD
  mysql -u root -e "CREATE DATABASE IF NOT EXISTS chartbrew"
  mysql -u root -e "CREATE USER IF NOT EXISTS 'chartbrew'@'127.0.0.1' IDENTIFIED BY '${CB_DB_PASSWORD}'"
  mysql -u root -e "GRANT ALL PRIVILEGES ON chartbrew.* TO 'chartbrew'@'127.0.0.1'"
fi

exec node /app/start.js
