#!/usr/bin/env bash
# Rename the Zellij tab that contains the calling process (e.g. "GRO-12 Add shopping list").
# No-op outside Zellij.
#
# Usage: scripts/ai/rename-tab.sh "<new name>"
set -euo pipefail

name="${1:-}"
[ -n "$name" ] || { echo "Usage: $0 \"<new name>\"" >&2; exit 1; }
name="$(printf '%s' "$name" | tr '\n\r\t' '   ' | cut -c1-30 | sed -E 's/ +$//')"

if [ -z "${ZELLIJ:-}" ]; then
  echo "Not running inside Zellij — tab not renamed"
  exit 0
fi

# Target our own tab through the pane id so it works even when another tab has focus
tab_id=""
if [ -n "${ZELLIJ_PANE_ID:-}" ] && command -v jq >/dev/null; then
  tab_id="$(zellij action list-panes --tab --json 2>/dev/null | jq -r --arg id "$ZELLIJ_PANE_ID" \
    '[.[] | select((.is_plugin | not) and (.id | tostring) == $id)] | first | .tab_id // empty' 2>/dev/null || true)"
fi

if [ -n "$tab_id" ]; then
  zellij action rename-tab-by-id "$tab_id" "$name"
else
  zellij action rename-tab "$name"
fi
echo "Renamed Zellij tab to '$name'"
