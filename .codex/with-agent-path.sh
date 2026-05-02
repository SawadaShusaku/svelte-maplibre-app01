#!/usr/bin/env bash
set -euo pipefail

script_dir="$(
  cd -- "$(dirname -- "$0")" && pwd
)"

export PATH="$script_dir/shims:$PATH"

if [ "$#" -eq 0 ]; then
  exec "${SHELL:-/bin/sh}"
fi

exec "$@"
