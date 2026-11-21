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

zellij_session_state() {
  # Prints "running", "exited" or nothing for session $1
  zellij list-sessions --no-formatting 2>/dev/null | awk -v s="$1" '$1 == s { print (/EXITED/ ? "exited" : "running"); exit }'
}

# Open a Zellij tab running Claude Code: in the current session, the running AI session,
# or a new AI session (attached here when interactive). Claude starts through with-node.sh
# so it gets the .nvmrc Node even when the Zellij server was started from an older shell.
# Usage: open_task_tab <tab name> <cwd> <claude args...>
open_task_tab() {
  local tab="$1" cwd="$2" claude_bin kdl_args="" arg session base n lock
  shift 2
  claude_bin="$(command -v claude)"
  for arg in "$claude_bin" "$@"; do kdl_args="$kdl_args \"$(kdl "$arg")\""; done

  _ai_layout_dir="$(mktemp -d)"
  trap 'rm -rf "$_ai_layout_dir"' EXIT
  # default_tab_template keeps Zellij's tab bar (top) and status bar (bottom), as in the default layout
  printf 'layout {\ndefault_tab_template {\n  pane size=1 borderless=true {\n    plugin location="zellij:tab-bar"\n  }\n  children\n  pane size=2 borderless=true {\n    plugin location="zellij:status-bar"\n  }\n}\ntab name="%s" cwd="%s" {\n  pane command="%s" close_on_exit=false {\n    args%s\n  }\n}\n}\n' \
    "$(kdl "$tab")" "$(kdl "$cwd")" "$(kdl "$MAIN_REPO/scripts/ai/with-node.sh")" "$kdl_args" > "$_ai_layout_dir/task.kdl"

  if [ -n "${ZELLIJ:-}" ]; then
    zellij action new-tab --layout "$_ai_layout_dir/task.kdl" >/dev/null
    info "Started in a new tab of the current Zellij session"
    return 0
  fi

  # Serialise session selection/creation so parallel starts don't delete each other's new session
  lock="$(git -C "$MAIN_REPO" rev-parse --path-format=absolute --git-common-dir)/ai-zellij.lock"
  n=0
  until mkdir "$lock" 2>/dev/null; do
    n=$((n + 1))
    if [ "$n" -gt 300 ]; then rm -rf "$lock"; fi
    sleep 0.1
  done
  trap 'rm -rf "$_ai_layout_dir" "$lock"' EXIT

  base="$AI_ZELLIJ_SESSION"
  session="$base"
  if [ "$(zellij_session_state "$session")" = "running" ]; then
    # Zellij ignores new-tab for a session without an attached client: check clients first, then the tab
    if [ "$(zellij --session "$session" action list-clients 2>/dev/null | awk 'NR > 1 && NF' | wc -l)" -gt 0 ]; then
      zellij --session "$session" action new-tab --layout "$_ai_layout_dir/task.kdl" >/dev/null || true
    fi
    if zellij --session "$session" action list-tabs 2>/dev/null | awk 'NR > 1' | grep -qF "$tab"; then
      rm -rf "$lock"
      info "Started in Zellij session '$session'"
      echo "  Attach:  zellij attach $session"
      echo "  Switch tabs:  Ctrl-t (tab mode: h/l or arrows)  |  Alt-h / Alt-l  |  Ctrl-o d (detach)"
      return 0
    fi
    # Detached session: start this task in its own session instead of failing
    n=2
    while [ -n "$(zellij_session_state "$base-$n")" ]; do n=$((n + 1)); done
    session="$base-$n"
    info "Session '$base' has no attached client, so this task gets its own session '$session'"
  fi

  zellij delete-session --force "$session" >/dev/null 2>&1 || true
  zellij attach --create-background "$session" options --default-layout "$_ai_layout_dir/task.kdl"
  rm -rf "$lock"
  info "Created Zellij session '$session'"
  if [ -t 0 ] && [ -t 1 ]; then
    exec zellij attach "$session"
  fi
  echo "  Attach:  zellij attach $session"
  echo "  Switch tabs:  Ctrl-t (tab mode: h/l or arrows)  |  Alt-h / Alt-l  |  Ctrl-o d (detach)"
}
