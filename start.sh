#!/bin/sh
set -eu

salt-master -l info &
exec salt-api -l info
