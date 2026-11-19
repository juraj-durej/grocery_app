#!/usr/bin/env bash
# Verify the AI task setup without changing anything: tools, GitHub CLI auth and base branch.
#
# Usage: scripts/ai/doctor.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

failures=0
ok() { echo "  ✔ $*"; }
bad() { echo "  ✖ $*"; failures=$((failures + 1)); }
check() { local label="$1"; shift; if "$@" >/dev/null 2>&1; then ok "$label"; else bad "$label"; fi; }

echo "Tools"
check "git installed" command -v git
check "node installed" command -v node
check "npm installed" command -v npm
check "claude installed" command -v claude
check "zellij installed (brew install zellij)" command -v zellij
check "jq installed (brew install jq)" command -v jq
check "lsof installed" command -v lsof

echo "GitHub"
if command -v gh >/dev/null; then
  ok "gh installed"
  check "gh authenticated" gh auth status
else
  bad "gh missing — install and log in: brew install gh && gh auth login"
fi
git -C "$MAIN_REPO" fetch origin --quiet 2>/dev/null
check "origin/$AI_BASE_BRANCH exists" git -C "$MAIN_REPO" rev-parse --verify "origin/$AI_BASE_BRANCH"
check "git can reach origin (keychain credentials)" git -C "$MAIN_REPO" ls-remote --exit-code origin HEAD

echo
if [ "$failures" -eq 0 ]; then echo "✔ All checks passed"; else echo "✖ $failures check(s) failed"; exit 1; fi
