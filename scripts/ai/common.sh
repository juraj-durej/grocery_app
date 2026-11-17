#!/usr/bin/env bash
# Shared helpers for scripts/ai/*.sh (sourced, bash 3.2 compatible).

die() { echo "✖ $*" >&2; exit 1; }
info() { echo "▶ $*"; }

# Main repo root, even when called from inside a worktree
MAIN_REPO="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
DEVCONTAINER_CONFIG="$MAIN_REPO/.devcontainer/devcontainer.json"
DEVCONTAINER_CLI="npx -y @devcontainers/cli@0.90.0"
JIRA="$MAIN_REPO/.devcontainer/bin/jira"

ENV_FILE="${AI_ENV_FILE:-$MAIN_REPO/.env.ai.local}"
[ -f "$ENV_FILE" ] || die "Missing $ENV_FILE — copy scripts/ai/env.example there and fill it in"
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

export AI_BASE_BRANCH="${AI_BASE_BRANCH:-development}"
export JIRA_STATUS_IN_PROGRESS="${JIRA_STATUS_IN_PROGRESS:-In Progress}"
export JIRA_STATUS_IN_REVIEW="${JIRA_STATUS_IN_REVIEW:-In Review}"
export GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-$(git config user.name)}"
export GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email)}"
AI_WORKTREES_DIR="${AI_WORKTREES_DIR:-$(dirname "$MAIN_REPO")/$(basename "$MAIN_REPO")-worktrees}"
AI_TMUX_SESSION="${AI_TMUX_SESSION:-ai-tasks}"
AI_COPY_FILES="${AI_COPY_FILES:-.env.local .env.development.local .env.test.local .claude/settings.local.json}"

for var in CLAUDE_CODE_OAUTH_TOKEN GH_TOKEN JIRA_BASE_URL JIRA_EMAIL JIRA_API_TOKEN FIGMA_API_KEY; do
  [ -n "${!var:-}" ] || die "$var is empty in $ENV_FILE"
done
