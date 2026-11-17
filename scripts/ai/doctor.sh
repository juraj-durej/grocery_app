#!/usr/bin/env bash
# Verify the AI task setup without changing anything: tools, base branch, and every credential.
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
for bin in git docker tmux jq curl npx perl; do check "$bin installed" command -v "$bin"; done
check "Docker running" docker info

echo "Git / GitHub"
repo="$(git -C "$MAIN_REPO" remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
git -C "$MAIN_REPO" fetch origin --quiet
check "origin/$AI_BASE_BRANCH exists" git -C "$MAIN_REPO" rev-parse --verify "origin/$AI_BASE_BRANCH"
perms="$(curl -sS -H "Authorization: Bearer $GH_TOKEN" "https://api.github.com/repos/$repo" | jq -r '.permissions.push // "no"')"
[ "$perms" = "true" ] && ok "GH_TOKEN can push to $repo" || bad "GH_TOKEN cannot push to $repo (needs Contents: read & write)"
pr_status="$(curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $GH_TOKEN" "https://api.github.com/repos/$repo/pulls?per_page=1")"
[ "$pr_status" = "200" ] && ok "GH_TOKEN can read pull requests" || bad "GH_TOKEN cannot access pull requests (HTTP $pr_status)"
# Authenticated dry-run push over HTTPS (same transport the containers use; nothing is pushed)
check "git push over HTTPS authenticates (dry run)" git -C "$MAIN_REPO" \
  -c credential.helper= -c "credential.helper=!f() { echo username=x-access-token; echo password=\$GH_TOKEN; }; f" \
  push --dry-run "https://github.com/$repo.git" "HEAD:refs/heads/ai-doctor-dry-run"

echo "Jira"
me="$(curl -sS -u "$JIRA_EMAIL:$JIRA_API_TOKEN" "${JIRA_BASE_URL%/}/rest/api/3/myself" | jq -r '.displayName // empty' 2>/dev/null)"
[ -n "$me" ] && ok "Jira auth as $me" || bad "Jira auth failed (JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN)"

echo "Figma"
figma_user="$(curl -sS -H "X-Figma-Token: $FIGMA_API_KEY" https://api.figma.com/v1/me | jq -r '.handle // empty' 2>/dev/null)"
[ -n "$figma_user" ] && ok "Figma auth as $figma_user" || bad "Figma auth failed (FIGMA_API_KEY)"

echo "Claude"
reply="$(CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN" claude -p "Reply with exactly: OK" 2>&1 | tail -n 1)"
[ "$reply" = "OK" ] && ok "CLAUDE_CODE_OAUTH_TOKEN works" || bad "CLAUDE_CODE_OAUTH_TOKEN failed: $reply"

echo
if [ "$failures" -eq 0 ]; then echo "✔ All checks passed"; else echo "✖ $failures check(s) failed"; exit 1; fi
