#!/usr/bin/env bash
# Give a working tree (main repo or git worktree) its own random app and PGlite DB ports, so several
# tasks can run dev/build/e2e at once and nothing collides with 3000 / 5432 (e.g. Postgres.app).
# Ports are picked at random from 20000-48999 (below the macOS ephemeral range), skipping ports
# owned by another tree or already listening. Writes PORT, DB_PORT, DATABASE_URL and
# NEXT_PUBLIC_APP_URL to the tree's .env.local. Also warns when the shell's Node is older than .nvmrc.
#
# Usage: scripts/ai/setup-worktree.sh   (idempotent; run from inside the tree)
set -euo pipefail

common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
wt="$(git rev-parse --show-toplevel)"
main_repo="$(cd "$common_dir/.." && pwd)"
registry_dir="$common_dir/ai-ports"
registry="$registry_dir/registry.tsv"
lock="$registry_dir/lock"
mkdir -p "$registry_dir"
touch "$registry"

want_node="$(tr -dc '0-9.' < "$wt/.nvmrc" | cut -d. -f1)"
have_node="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$have_node" -lt "$want_node" ]; then
  echo "WARNING: this session runs Node $have_node but the repo needs Node $want_node (.nvmrc)." \
    "Git hooks still work (scripts/ai/with-node.sh); prefix other node/npm commands with scripts/ai/with-node.sh," \
    "or restart the terminal/Zellij session so it picks up the nvm default."
fi

# Serialise concurrent runs (mkdir is atomic)
tries=0
until mkdir "$lock" 2>/dev/null; do
  tries=$((tries + 1))
  if [ "$tries" -gt 100 ]; then rm -rf "$lock"; fi
  sleep 0.1
done
trap 'rm -rf "$lock"' EXIT

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

# Prune entries (path<TAB>app_port<TAB>db_port) of worktrees that no longer exist,
# and legacy sequential ones (3100+/5500+) so they get random ports
live="$(git worktree list --porcelain | sed -n 's/^worktree //p')"
pruned="$(mktemp)"
while IFS=$'\t' read -r path app db; do
  [ -n "$path" ] || continue
  [ "$app" -ge 20000 ] || continue
  if printf '%s\n' "$live" | grep -qxF "$path"; then printf '%s\t%s\t%s\n' "$path" "$app" "$db" >> "$pruned"; fi
done < "$registry"
mv "$pruned" "$registry"

entry="$(awk -F'\t' -v p="$wt" '$1 == p { print $2 "\t" $3 }' "$registry")"
if [ -n "$entry" ]; then
  app_port="${entry%%$'\t'*}"
  db_port="${entry##*$'\t'}"
else
  # Random free port (not $1) that no other tree owns and nothing is listening on
  random_port() {
    local p
    while :; do
      p=$((20000 + (RANDOM * 32768 + RANDOM) % 29000))
      [ "$p" != "${1:-}" ] || continue
      awk -F'\t' -v p="$p" '$2 == p || $3 == p { f = 1 } END { exit !f }' "$registry" && continue
      listening "$p" && continue
      echo "$p"
      return
    done
  }
  app_port="$(random_port)"
  db_port="$(random_port "$app_port")"
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
  (cd "$wt" && "$main_repo/scripts/ai/with-node.sh" npm install --prefer-offline --no-audit --no-fund >&2)
fi

echo "Ports for this tree: app http://localhost:$app_port (PORT=$app_port), PGlite DB $db_port (DB_PORT=$db_port) — set in .env.local"
