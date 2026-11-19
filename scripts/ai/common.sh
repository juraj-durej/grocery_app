#!/usr/bin/env bash
# Shared helpers for scripts/ai/*.sh (sourced, bash 3.2 compatible).

die() { echo "✖ $*" >&2; exit 1; }
info() { echo "▶ $*"; }

# Main repo root, even when called from inside a worktree
MAIN_REPO="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"

AI_BASE_BRANCH="${AI_BASE_BRANCH:-develop}"
AI_ZELLIJ_SESSION="${AI_ZELLIJ_SESSION:-ai-tasks}"
export AI_BASE_BRANCH AI_ZELLIJ_SESSION

# Escape for a KDL quoted string
kdl() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN { ORS = "" } NR > 1 { print "\\n" } { print }'; }

# Open a Zellij tab running Claude Code: in the current session, the running AI session,
# or a new AI session (attached here when interactive).
# Usage: open_task_tab <tab name> <cwd> <claude args...>
open_task_tab() {
  local tab="$1" cwd="$2" claude_bin kdl_args="" arg session
  shift 2
  claude_bin="$(command -v claude)"
  for arg in "$@"; do kdl_args="$kdl_args \"$(kdl "$arg")\""; done

  _ai_layout_dir="$(mktemp -d)"
  trap 'rm -rf "$_ai_layout_dir"' EXIT
  printf 'layout {\ntab name="%s" cwd="%s" {\n  pane command="%s" close_on_exit=false {\n    args%s\n  }\n}\n}\n' \
    "$(kdl "$tab")" "$(kdl "$cwd")" "$(kdl "$claude_bin")" "$kdl_args" > "$_ai_layout_dir/task.kdl"

  if [ -n "${ZELLIJ:-}" ]; then
    zellij action new-tab --layout "$_ai_layout_dir/task.kdl" >/dev/null
    info "Started in a new tab of the current Zellij session"
    return 0
  fi

  session="$AI_ZELLIJ_SESSION"
  if zellij list-sessions --no-formatting 2>/dev/null | grep -E "^$session( |\$)" | grep -qv EXITED; then
    # Zellij ignores new-tab for a session without an attached client; verify it was created
    zellij --session "$session" action new-tab --layout "$_ai_layout_dir/task.kdl" >/dev/null || true
    if zellij --session "$session" action list-tabs 2>/dev/null | grep -qF "$tab"; then
      info "Started in Zellij session '$session'"
    else
      die "Zellij ignored the new tab (session has no attached client) — attach with 'zellij attach $session' and re-run"
    fi
    echo "  Attach:  zellij attach $session"
  else
    zellij delete-session --force "$session" >/dev/null 2>&1 || true
    zellij attach --create-background "$session" options --default-layout "$_ai_layout_dir/task.kdl"
    info "Created Zellij session '$session'"
    if [ -t 0 ] && [ -t 1 ]; then
      exec zellij attach "$session"
    fi
    echo "  Attach:  zellij attach $session"
  fi
  echo "  Switch tabs:  Ctrl-t (tab mode: h/l or arrows)  |  Alt-h / Alt-l  |  Ctrl-o d (detach)"
}
