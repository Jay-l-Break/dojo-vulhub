#!/bin/bash
set -euo pipefail

tr -d '-' </proc/sys/kernel/random/uuid >/etc/machine-id
xvfb-run -a -s '-screen 0 1280x1024x24' \
  node_modules/electron/dist/electron . --no-sandbox --disable-gpu &
wait $!
