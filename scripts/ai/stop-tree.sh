#!/usr/bin/env bash
# Stop the dev server / DB server of THIS worktree: kills only processes listening on the tree's
# PORT and DB_PORT (from its .env.local) whose command line or cwd is inside this worktree.
# Listeners owned by other trees or other programs are reported and left running.
#
# Usage: scripts/ai/stop-tree.sh [--clean-next-dev]
#   --clean-next-dev  also remove <tree>/.next/dev (stale Next.js dev cache/lock)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

usage() { echo "Usage: scripts/ai/stop-tree.sh [--clean-next-dev]" >&2; exit 2; }

clean_next=0
for arg in "$@"; do
  case "$arg" in
    --clean-next-dev) clean_next=1 ;;
    *) usage ;;
  esac
done

tree="$(git rev-parse --show-toplevel)"
env_file="$tree/.env.local"
[ -f "$env_file" ] || die "$env_file not found; run scripts/ai/setup-worktree.sh"

# Last value wins, like dotenv; the file is parsed, never sourced
env_value() { sed -n "s/^$1=//p" "$env_file" | tail -n 1 | tr -d "\"' \r"; }
app_port="$(env_value PORT)"
db_port="$(env_value DB_PORT)"
for pair in "PORT=$app_port" "DB_PORT=$db_port"; do
  case "${pair#*=}" in
    ''|*[!0-9]*) die "${pair%%=*} in $env_file is missing or not numeric" ;;
  esac
done

# True when PID's command line or cwd is inside this worktree (trailing slash: task-1 != task-10)
in_tree() {
  local pid="$1" cmd cwd
  cmd=" $(ps -o command= -p "$pid" 2>/dev/null || true) "
  case "$cmd" in
    *" $tree "*|*" $tree/"*|*"=$tree/"*|*"=$tree "*) return 0 ;;
  esac
  cwd="$(lsof -a -d cwd -p "$pid" -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"
  case "$cwd" in
    "$tree"|"$tree"/*) return 0 ;;
  esac
  return 1
}

listeners() { lsof -t -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u || true; }

killed=""
for port in "$app_port" "$db_port"; do
  pids="$(listeners "$port")"
  if [ -z "$pids" ]; then echo "nothing running on port $port"; continue; fi
  for pid in $pids; do
    if in_tree "$pid"; then
      echo "stopping PID $pid on port $port: $(ps -o command= -p "$pid" | cut -c1-120)"
      kill -TERM "$pid" 2>/dev/null || true
      killed="$killed $pid"
    else
      echo "port $port held by PID $pid outside this tree, left running"
    fi
  done
done

# Wait up to 5s for SIGTERM, then SIGKILL survivors
for _ in 1 2 3 4 5 6 7 8 9 10; do
  alive=""
  for pid in $killed; do kill -0 "$pid" 2>/dev/null && alive="$alive $pid"; done
  [ -n "$alive" ] || break
  sleep 0.5
done
for pid in ${alive:-}; do
  echo "PID $pid ignored SIGTERM, sending SIGKILL"
  kill -KILL "$pid" 2>/dev/null || true
done
[ -z "${alive:-}" ] || sleep 0.5

if [ "$clean_next" = 1 ]; then
  rm -rf "${tree:?}/.next/dev"
  echo "removed $tree/.next/dev"
fi

# Verify: fail only if a port is still held by a process of this tree
status=0
for port in "$app_port" "$db_port"; do
  held=0
  for pid in $(listeners "$port"); do
    if in_tree "$pid"; then held=1; fi
  done
  if [ "$held" = 1 ]; then
    echo "✖ port $port is still held by a process of this tree" >&2
    status=1
  else
    echo "port $port is free for this tree"
  fi
done
exit "$status"
