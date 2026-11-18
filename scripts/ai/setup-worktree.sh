#!/usr/bin/env bash
# Give a git worktree its own app and PGlite DB ports so several tasks can run dev/build/e2e at once.
# Writes PORT, DB_PORT, DATABASE_URL and NEXT_PUBLIC_APP_URL to the worktree's .env.local.
# Does nothing in the main working tree (defaults 3000 / 5432 stay).
#
# Usage: scripts/ai/setup-worktree.sh   (idempotent; run from inside the worktree)
set -euo pipefail

git_dir="$(git rev-parse --path-format=absolute --git-dir)"
common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
[ "$git_dir" != "$common_dir" ] || exit 0

wt="$(git rev-parse --show-toplevel)"
main_repo="$(cd "$common_dir/.." && pwd)"
registry_dir="$common_dir/ai-ports"
registry="$registry_dir/registry.tsv"
lock="$registry_dir/lock"
mkdir -p "$registry_dir"
touch "$registry"

# Serialise concurrent runs (mkdir is atomic)
tries=0
until mkdir "$lock" 2>/dev/null; do
  tries=$((tries + 1))
  if [ "$tries" -gt 100 ]; then rm -rf "$lock"; fi
  sleep 0.1
done
trap 'rm -rf "$lock"' EXIT

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

# Prune entries (path<TAB>app_port<TAB>db_port) of worktrees that no longer exist
live="$(git worktree list --porcelain | sed -n 's/^worktree //p')"
pruned="$(mktemp)"
while IFS=$'\t' read -r path app db; do
  [ -n "$path" ] || continue
  if printf '%s\n' "$live" | grep -qxF "$path"; then printf '%s\t%s\t%s\n' "$path" "$app" "$db" >> "$pruned"; fi
done < "$registry"
mv "$pruned" "$registry"

entry="$(awk -F'\t' -v p="$wt" '$1 == p { print $2 "\t" $3 }' "$registry")"
if [ -n "$entry" ]; then
  app_port="${entry%%$'\t'*}"
  db_port="${entry##*$'\t'}"
else
  # First free port at or above $1 that no other worktree owns and nothing is listening on
  next_port() {
    local p="$1" col="$2"
    while awk -F'\t' -v c="$col" -v p="$p" '$c == p { f = 1 } END { exit !f }' "$registry" || listening "$p"; do
      p=$((p + 1))
    done
    echo "$p"
  }
  app_port="$(next_port 3100 2)"
  db_port="$(next_port 5500 3)"
  printf '%s\t%s\t%s\n' "$wt" "$app_port" "$db_port" >> "$registry"
fi

# Seed secrets from the main repo's .env.local on first setup, then (re)write the managed keys
env_file="$wt/.env.local"
if [ ! -f "$env_file" ] && [ -f "$main_repo/.env.local" ]; then cp "$main_repo/.env.local" "$env_file"; fi
touch "$env_file"
tmp="$(mktemp)"
grep -vE '^(PORT|DB_PORT|DATABASE_URL|NEXT_PUBLIC_APP_URL)=' "$env_file" > "$tmp" || true
cat >> "$tmp" <<ENV
PORT=$app_port
DB_PORT=$db_port
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:$db_port/postgres
NEXT_PUBLIC_APP_URL=http://localhost:$app_port
ENV
mv "$tmp" "$env_file"

if [ ! -d "$wt/node_modules" ]; then
  echo "Installing dependencies…"
  (cd "$wt" && npm install --prefer-offline --no-audit --no-fund >&2)
fi

echo "Worktree ports: app http://localhost:$app_port (PORT=$app_port), PGlite DB $db_port (DB_PORT=$db_port) — set in .env.local"
