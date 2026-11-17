#!/usr/bin/env bash
# Runs inside a tmux window: starts the task's dev container and launches Claude on the ticket.
# When Claude exits, you get a shell inside the same container.
#
# Usage: scripts/ai/run-task.sh <KEY> <WORKTREE_PATH>
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

key="${1:?KEY required}"
worktree="${2:?worktree path required}"
git_common_dir="$(git -C "$worktree" rev-parse --path-format=absolute --git-common-dir)"

dc_args=(--workspace-folder "$worktree" --config "$DEVCONTAINER_CONFIG")

info "$key: starting dev container (first run builds the image and runs npm ci)…"
# shellcheck disable=SC2086
$DEVCONTAINER_CLI up "${dc_args[@]}" \
  --mount "type=bind,source=$git_common_dir,target=$git_common_dir" \
  --mount "type=bind,source=$MAIN_REPO/.claude/commands,target=/home/node/.claude/commands" \
  || { echo "✖ devcontainer up failed — press Enter to close"; read -r _; exit 1; }

info "$key: launching Claude"
# shellcheck disable=SC2086
$DEVCONTAINER_CLI exec "${dc_args[@]}" \
  claude --dangerously-skip-permissions --mcp-config /home/node/.ai/mcp.json -- "/solve-ticket $key"

echo
info "$key: Claude exited — opening a shell in the container (type 'claude --continue' to resume)"
# shellcheck disable=SC2086
exec $DEVCONTAINER_CLI exec "${dc_args[@]}" bash -l
