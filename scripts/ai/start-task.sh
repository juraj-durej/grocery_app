#!/usr/bin/env bash
# Start one AI agent: opens a Zellij tab running Claude Code in its own git worktree
# (`claude --worktree`) with the /solve-ticket command.
#
# Usage: scripts/ai/start-task.sh [--plan] [JIRA-KEY] [instructions...]
#   --plan (optional, anywhere) stops /solve-ticket after the technical plan for approval.
#   KEY is the first argument when it looks like GRO-12; everything else is free-text instructions.
#   Tab name: "GRO-12" (the agent renames it to "GRO-12 <short title>") or a short title from the instructions.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

case "${1:-}" in -h|--help) sed -n "2,7p" "$0"; exit 0 ;; esac
[ "$#" -gt 0 ] || die "Usage: $0 [--plan] [JIRA-KEY] [instructions...]"

plan=""
args=()
for arg in "$@"; do
  if [ "$arg" = "--plan" ]; then plan="--plan"; else args+=("$arg"); fi
done
set -- ${args[@]+"${args[@]}"}
key=""
if [ "$#" -gt 0 ] && [[ "$1" =~ ^[A-Z][A-Z0-9]+-[0-9]+$ ]]; then
  key="$1"
  shift
fi
instructions="$*"
[ -n "$key" ] || [ -n "$instructions" ] || die "Usage: $0 [--plan] [JIRA-KEY] [instructions...]"

for bin in git zellij claude; do
  command -v "$bin" >/dev/null || die "'$bin' is not installed"
done

slugify() {
  printf '%s' "$1" | perl -CS -MUnicode::Normalize -pe '$_ = NFD($_); s/\p{Mn}//g' | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

if [ -n "$key" ]; then
  base="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')"
  tab="$key"
else
  words="$(printf '%s' "$instructions" | tr '\n\r\t' '   ' | awk '{ for (i = 1; i <= 4 && i <= NF; i++) printf "%s%s", $i, (i < 4 && i < NF ? " " : "") }')"
  base="task-$(slugify "$words" | cut -c1-30 | sed -E 's/-+$//')"
  [ "$base" != "task-" ] || base="task"
  tab="$(printf '%s' "$words" | cut -c1-25 | sed -E 's/ +$//')"
  [ -n "$tab" ] || tab="task"
fi

name="$base"
n=2
while [ -e "$MAIN_REPO/.claude/worktrees/$name" ]; do
  name="$base-$n"
  n=$((n + 1))
done

prompt="/solve-ticket"
[ -z "$key" ] || prompt="$prompt $key"
[ -z "$plan" ] || prompt="$prompt $plan"
[ -z "$instructions" ] || prompt="$prompt $instructions"

info "Worktree '$name' (.claude/worktrees/$name), tab '$tab'"
open_task_tab "$tab" "$MAIN_REPO" --worktree "$name" "$prompt"
