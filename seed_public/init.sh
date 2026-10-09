#!/bin/bash
set -euo pipefail

base_url=http://127.0.0.1:80
cookie_file=$(mktemp)
owner_suffix=$(cat /proc/sys/kernel/random/uuid)
owner_email="owner-${owner_suffix}@local.invalid"
owner_password="Owner1!${owner_suffix}"

n8n start &
app_pid=$!

cleanup() {
  rm -f "$cookie_file"
  kill "$app_pid" 2>/dev/null || true
}
trap cleanup EXIT

until curl -fsS "$base_url/" >/dev/null; do
  sleep 2
done

curl -fsS "$base_url/rest/owner/setup" \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg email "$owner_email" --arg password "$owner_password" '{email: $email, firstName: "Public", lastName: "Seed", password: $password}')" \
  >/dev/null

curl -fsS "$base_url/rest/login" \
  -H 'Content-Type: application/json' \
  -c "$cookie_file" \
  -d "$(jq -n --arg email "$owner_email" --arg password "$owner_password" '{email: $email, password: $password}')" \
  >/dev/null

workflow_id=$(curl -fsS "$base_url/rest/workflows" \
  -H 'Content-Type: application/json' \
  -b "$cookie_file" \
  --data-binary @/opt/n8n/seed_public/workflow.json | jq -r '.data.id')

test -n "$workflow_id"
test "$workflow_id" != null

curl -fsS "$base_url/rest/workflows/$workflow_id" \
  -X PATCH \
  -H 'Content-Type: application/json' \
  -b "$cookie_file" \
  -d '{"active": true}' \
  >/dev/null

wait "$app_pid"
