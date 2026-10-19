#!/bin/bash
set -euo pipefail

base_url=http://127.0.0.1:80
cookie_file=$(mktemp)
owner_suffix=$(cat /proc/sys/kernel/random/uuid)
owner_email="owner-${owner_suffix}@local.invalid"
owner_password="Owner1!${owner_suffix}"
max_ready_attempts=60

fetch_json() {
  local label=$1
  shift
  local content_type
  local metrics
  local response_file
  local status
  response_file=$(mktemp)
  metrics=$(curl -sS "$@" -o "$response_file" -w '%{http_code}|%{content_type}' || true)
  status=${metrics%%|*}
  content_type=${metrics#*|}
  if [[ "$status" =~ ^2[0-9][0-9]$ ]] &&
    [[ "$content_type" == application/json* ]] &&
    jq empty "$response_file" >/dev/null 2>&1; then
    cat "$response_file"
    rm -f "$response_file"
    return 0
  fi
  printf '%s failed: status=%s content_type=%s\n' \
    "$label" "${status:-transport-error}" "${content_type:-unknown}" >&2
  rm -f "$response_file"
  return 1
}

wait_for_ready() {
  local attempt
  for ((attempt = 1; attempt <= max_ready_attempts; attempt++)); do
    if fetch_json "n8n readiness $attempt/$max_ready_attempts" \
      "$base_url/rest/settings" >/dev/null; then
      return 0
    fi
    sleep 2
  done
  printf 'n8n did not become ready after %d attempts\n' "$max_ready_attempts" >&2
  return 1
}

n8n start &
app_pid=$!

cleanup() {
  rm -f "$cookie_file"
  kill "$app_pid" 2>/dev/null || true
}
trap cleanup EXIT

wait_for_ready

fetch_json "owner setup" "$base_url/rest/owner/setup" \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg email "$owner_email" --arg password "$owner_password" '{email: $email, firstName: "Public", lastName: "Seed", password: $password}')" \
  >/dev/null

fetch_json "login" "$base_url/rest/login" \
  -H 'Content-Type: application/json' \
  -c "$cookie_file" \
  -d "$(jq -n --arg email "$owner_email" --arg password "$owner_password" '{email: $email, password: $password}')" \
  >/dev/null

workflow_response=$(fetch_json "workflow creation" "$base_url/rest/workflows" \
  -H 'Content-Type: application/json' \
  -b "$cookie_file" \
  --data-binary @/opt/n8n/seed_public/workflow.json)
if ! workflow_id=$(jq -er '.data.id | select(type == "string" and length > 0)' \
  <<<"$workflow_response"); then
  printf 'workflow creation returned JSON without a workflow ID\n' >&2
  exit 1
fi

fetch_json "workflow activation" "$base_url/rest/workflows/$workflow_id" \
  -X PATCH \
  -H 'Content-Type: application/json' \
  -b "$cookie_file" \
  -d '{"active": true}' \
  >/dev/null

wait "$app_pid"
