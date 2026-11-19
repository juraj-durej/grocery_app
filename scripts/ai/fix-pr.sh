#!/usr/bin/env bash
# Reopen an agent for an existing PR (merge conflict with develop, broken after another merge,
# failing CI, review feedback): opens a Zellij tab running Claude Code with /fix-pr.
# Reuses the PR branch's worktree if it still exists, otherwise creates a new one.
#
# Usage: scripts/ai/fix-pr.sh <PR-NUMBER | JIRA-KEY | BRANCH> [instructions...]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

case "${1:-}" in -h|--help) sed -n "2,6p" "$0"; exit 0 ;; esac
[ "$#" -gt 0 ] || die "Usage: $0 <PR-NUMBER | JIRA-KEY | BRANCH> [instructions...]"

for bin in git gh zellij claude jq; do
  command -v "$bin" >/dev/null || die "'$bin' is not installed"
done

ref="${1#\#}"
shift
instructions="$*"

if [[ "$ref" =~ ^[A-Z][A-Z0-9]+-[0-9]+$ ]]; then
  matches="$(cd "$MAIN_REPO" && gh pr list --state open --base "$AI_BASE_BRANCH" --search "$ref in:title" --json number --jq '.[].number')"
  count="$(printf '%s' "$matches" | grep -c . || true)"
  [ "$count" -eq 1 ] || die "Expected one open PR with '$ref' in the title, found $count — pass the PR number"
  ref="$matches"
fi

pr_json="$(cd "$MAIN_REPO" && gh pr view "$ref" --json number,headRefName,title,state)" || die "PR '$ref' not found"
number="$(printf '%s' "$pr_json" | jq -r .number)"
branch="$(printf '%s' "$pr_json" | jq -r .headRefName)"
title="$(printf '%s' "$pr_json" | jq -r .title)"
[ "$(printf '%s' "$pr_json" | jq -r .state)" = "OPEN" ] || die "PR #$number is not open"

key="$(printf '%s' "$title" | grep -oE '^[A-Z][A-Z0-9]+-[0-9]+' || true)"
tab="${key:-#$number} fix PR"

prompt="/fix-pr $number"
[ -z "$instructions" ] || prompt="$prompt $instructions"

# Worktree that already has the PR branch checked out (a branch can be checked out only once)
wt="$(git -C "$MAIN_REPO" worktree list --porcelain | awk -v b="refs/heads/$branch" '
  /^worktree / { path = substr($0, 10) }
  $0 == "branch " b { print path; exit }')"

if [ -n "$wt" ]; then
  [ "$wt" != "$MAIN_REPO" ] || die "Branch '$branch' is checked out in the main repo — switch it to develop first"
  info "PR #$number ($branch) in existing worktree $wt, tab '$tab'"
  open_task_tab "$tab" "$wt" "$prompt"
else
  base="fix-pr-$number"
  name="$base"
  n=2
  while [ -e "$MAIN_REPO/.claude/worktrees/$name" ]; do
    name="$base-$n"
    n=$((n + 1))
  done
  info "PR #$number ($branch) in new worktree '$name' (.claude/worktrees/$name), tab '$tab'"
  open_task_tab "$tab" "$MAIN_REPO" --worktree "$name" "$prompt"
fi
