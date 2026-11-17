#!/usr/bin/env bash
# Start one AI agent per Jira task: worktree + branch + "In Progress" + tmux window
# running Claude inside a dedicated dev container.
#
# Usage: scripts/ai/start-tasks.sh [--attach] KEY-1 [KEY-2 ...]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

attach=0
keys=()
for arg in "$@"; do
  case "$arg" in
    --attach) attach=1 ;;
    -h|--help) sed -n '2,6p' "$0"; exit 0 ;;
    *) keys+=("$(printf '%s' "$arg" | tr '[:lower:]' '[:upper:]')") ;;
  esac
done
[ "${#keys[@]}" -gt 0 ] || die "Usage: $0 [--attach] KEY-1 [KEY-2 ...]"

for bin in git docker tmux jq curl npx; do
  command -v "$bin" >/dev/null || die "'$bin' is not installed (macOS: brew install $bin)"
done
docker info >/dev/null 2>&1 || die "Docker is not running"

info "Fetching origin…"
git -C "$MAIN_REPO" fetch origin --prune --quiet
git -C "$MAIN_REPO" rev-parse --verify --quiet "origin/$AI_BASE_BRANCH" >/dev/null \
  || die "Branch origin/$AI_BASE_BRANCH does not exist — push it first (or set AI_BASE_BRANCH)"

mkdir -p "$AI_WORKTREES_DIR"

for key in "${keys[@]}"; do
  echo
  [[ "$key" =~ ^[A-Z][A-Z0-9]+-[0-9]+$ ]] || { echo "✖ Skipping invalid key '$key'" >&2; continue; }

  info "$key: loading from Jira"
  issue="$("$JIRA" json "$key")" || { echo "✖ Could not load $key" >&2; continue; }
  summary="$(echo "$issue" | jq -r '.fields.summary')"
  issue_type="$(echo "$issue" | jq -r '.fields.issuetype.name' | tr '[:upper:]' '[:lower:]')"
  case "$issue_type" in bug) prefix=fix ;; *) prefix=feat ;; esac
  slug="$(printf '%s' "$summary" | perl -CS -MUnicode::Normalize -pe '$_ = NFD($_); s/\p{Mn}//g' | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' | cut -c1-40 | sed -E 's/-+$//')"
  branch="$prefix/$key${slug:+-$slug}"
  worktree="$AI_WORKTREES_DIR/$key"

  if [ -d "$worktree" ]; then
    info "$key: reusing existing worktree $worktree"
  elif git -C "$MAIN_REPO" show-ref --verify --quiet "refs/heads/$branch"; then
    info "$key: adding worktree for existing branch $branch"
    git -C "$MAIN_REPO" worktree add "$worktree" "$branch"
  else
    info "$key: creating worktree $worktree on new branch $branch (from origin/$AI_BASE_BRANCH)"
    git -C "$MAIN_REPO" worktree add --no-track -b "$branch" "$worktree" "origin/$AI_BASE_BRANCH"
  fi

  # Copy git-ignored local files the app needs (secrets, local settings)
  for file in $AI_COPY_FILES; do
    if [ -f "$MAIN_REPO/$file" ] && [ ! -f "$worktree/$file" ]; then
      mkdir -p "$(dirname "$worktree/$file")"
      cp "$MAIN_REPO/$file" "$worktree/$file"
    fi
  done

  info "$key: moving to '$JIRA_STATUS_IN_PROGRESS'"
  "$JIRA" transition "$key" "$JIRA_STATUS_IN_PROGRESS" || echo "⚠ Could not transition $key (already there?)" >&2

  window="$key $(printf '%s' "$summary" | cut -c1-40)"
  run_cmd="$(printf '%q ' "$SCRIPT_DIR/run-task.sh" "$key" "$worktree")"
  if ! tmux has-session -t "$AI_TMUX_SESSION" 2>/dev/null; then
    window_id="$(tmux new-session -d -P -F '#{window_id}' -s "$AI_TMUX_SESSION" -n "$window" -c "$worktree" "$run_cmd")"
  else
    window_id="$(tmux new-window -d -P -F '#{window_id}' -t "$AI_TMUX_SESSION:" -n "$window" -c "$worktree" "$run_cmd")"
  fi
  # Keep the "KEY title" name even when Claude sets the terminal title
  tmux set-option -w -t "$window_id" allow-rename off
  tmux set-option -w -t "$window_id" automatic-rename off
  info "$key: started in tmux window '$window'"
done

echo
echo "✔ Agents running in tmux session '$AI_TMUX_SESSION'"
echo "  Attach:  tmux attach -t $AI_TMUX_SESSION      (iTerm native tabs: tmux -CC attach -t $AI_TMUX_SESSION)"
echo "  Switch:  Ctrl-b w (list)  |  Ctrl-b n / p (next / previous)  |  Ctrl-b d (detach)"

if [ "$attach" -eq 1 ] && [ -t 1 ] && [ -z "${TMUX:-}" ]; then
  exec tmux attach -t "$AI_TMUX_SESSION"
fi
