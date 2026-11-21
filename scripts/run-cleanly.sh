#!/usr/bin/env bash
# Runs a command and, when stopped (INT/TERM/HUP) or finished, stops every process it spawned,
# so a cut-off `npm run dev` / `build-local` never leaves the DB server or Next.js holding a port.
# Needed because npm-run-all (run-p) does not forward signals to its children.
# Bash 3.2 compatible.
# Usage: scripts/run-cleanly.sh <command> [args...]

descendants() {
  local c
  for c in $(pgrep -P "$1" 2>/dev/null); do
    descendants "$c"
    echo "$c"
  done
}

stop_all() {
  local pids i
  trap - INT TERM HUP EXIT
  pids="$(descendants $$)"
  [ -z "$pids" ] || kill -TERM $pids 2>/dev/null || true
  for i in 1 2 3 4 5 6 7 8 9 10; do
    pids="$(descendants $$)"
    [ -n "$pids" ] || return 0
    sleep 0.5
  done
  kill -KILL $pids 2>/dev/null || true
}

trap 'stop_all; exit 143' INT TERM HUP
trap stop_all EXIT

# Async jobs of a non-interactive shell ignore SIGINT; reset it so Ctrl-C reaches the command
( trap - INT; exec "$@" ) &
wait $!
