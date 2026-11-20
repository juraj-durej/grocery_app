#!/usr/bin/env bash
# Run a command with the Node major version from .nvmrc, even when the calling shell
# (e.g. a long-lived Zellij server) still has an older Node first on PATH.
# Looks in nvm, then Homebrew node@<major>. Used by lefthook and the AI task tabs.
#
# Usage: scripts/ai/with-node.sh <command> [args...]
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
want="$(tr -dc '0-9.' < "$root/.nvmrc" | cut -d. -f1)"
have="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"

if [ "$have" -lt "$want" ]; then
  nvm_dir="${NVM_DIR:-$HOME/.nvm}"
  version="$(for d in "$nvm_dir"/versions/node/v"$want".*; do
    if [ -x "$d/bin/node" ]; then echo "${d##*/}"; fi
  done | sort -t. -k2,2n -k3,3n | tail -1)"
  if [ -n "$version" ]; then
    bin="$nvm_dir/versions/node/$version/bin"
  elif [ -x "/opt/homebrew/opt/node@$want/bin/node" ]; then
    bin="/opt/homebrew/opt/node@$want/bin"
  else
    echo "✖ Node $want required (.nvmrc), found $have. Install it: nvm install $want" >&2
    exit 1
  fi
  export PATH="$bin:$PATH"
fi

exec "$@"
