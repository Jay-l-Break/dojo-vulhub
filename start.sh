#!/bin/sh
set -eu

python3 /usr/local/bin/gateway.py &
exec salt-master -l info
