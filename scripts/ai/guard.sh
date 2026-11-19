#!/usr/bin/env bash
# Claude Code PreToolUse guard (bash 3.2 compatible). Reads hook JSON on stdin.
# Blocks (exit 2 + reason on stderr): drizzle push, pushes to main/develop,
# unsafe force pushes, --no-verify, and any writes to .github/.
# Test override: GUARD_BRANCH forces the "current branch" value.

block() { echo "BLOCKED by scripts/ai/guard.sh: $*" >&2; exit 2; }

INPUT="$(cat)"
TOOL="$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')"
CWD="$(printf '%s' "$INPUT" | jq -r '.cwd // empty')"
[ -n "$CWD" ] || CWD="${CLAUDE_PROJECT_DIR:-.}"

current_branch() {
  if [ -n "${GUARD_BRANCH:-}" ]; then echo "$GUARD_BRANCH"; return; fi
  git -C "$CWD" branch --show-current 2>/dev/null
}

is_protected() { case "$1" in main|develop) return 0 ;; *) return 1 ;; esac; }

# Strips quotes/brackets and the refs/heads/ prefix from a ref token.
clean_ref() {
  local r="$1"
  r="${r#+}"
  r="$(printf '%s' "$r" | tr -d "\"'(){}")"
  r="${r##*:}"
  r="${r#refs/heads/}"
  printf '%s' "$r"
}

check_push() {
  local line="$1" branch tok skip=0 force=0 lease=0 npos=0 dst
  branch="$(current_branch)"
  set -f
  # shellcheck disable=SC2086
  set -- $line
  set +f
  # drop "git [-C dir] push"
  shift
  while [ $# -gt 0 ] && [ "$1" != "push" ]; do shift; done
  shift
  for tok in "$@"; do
    if [ "$skip" = 1 ]; then skip=0; continue; fi
    case "$tok" in
      --force-with-lease*|--force-if-includes) lease=1 ;;
      --force|-f) force=1 ;;
      --mirror|--all) block "git push $tok can overwrite protected branches." ;;
      --no-verify) block "--no-verify bypasses lefthook hooks." ;;
      -o|--push-option|--repo|--receive-pack) skip=1 ;;
      --*) ;;
      -*) case "$tok" in *f*) force=1 ;; esac ;;
      *)
        npos=$((npos + 1))
        if [ "$npos" -gt 1 ]; then
          dst="$(clean_ref "$tok")"
          if [ "$dst" = "HEAD" ]; then dst="$branch"; fi
          if is_protected "$dst"; then block "pushing to '$dst' is not allowed; open a PR instead."; fi
        fi
        ;;
    esac
  done
  if [ "$force" = 1 ] && [ "$lease" = 0 ]; then
    block "force push without --force-with-lease."
  fi
  # No explicit refspec: pushes the current branch
  if [ "$npos" -le 1 ] && is_protected "$branch"; then
    block "current branch '$branch' is protected; push a feature branch instead."
  fi
}

check_bash() {
  local cmd="$1" line seg lines
  lines="$(printf '%s' "$cmd" | sed -E 's/&&/;/g' | tr ';|' '\n\n')"
  case "$cmd" in
    *"drizzle-kit push"*|*"drizzle-kit  push"*|*db:push*)
      block "drizzle push is forbidden; use db:generate and db:migrate." ;;
  esac
  while IFS= read -r line; do
    # strip leading whitespace, parens/braces and VAR=value prefixes
    seg="$(printf '%s' "$line" | sed -E 's/^[[:space:](){}]+//; s/^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)+//')"
    case "$seg" in
      gh\ *|"") continue ;;
    esac
    if printf '%s' "$seg" | grep -Eq '^git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+(push|commit)([[:space:]]|$)'; then
      case " $seg " in
        *" --no-verify "*) block "--no-verify bypasses lefthook hooks." ;;
      esac
      if printf '%s' "$seg" | grep -Eq '^git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+push([[:space:]]|$)'; then
        check_push "$seg"
      fi
    fi
    # .github/ writes
    case "$seg" in
      *.github*)
        if printf '%s' "$seg" | grep -Eq '(^|[[:space:]])(rm|mv|cp|tee|touch|mkdir|chmod|truncate|install|ln|dd|rsync|patch|sed[[:space:]]+(-[A-Za-z]*i[A-Za-z]*|--in-place)|perl[[:space:]]+-[A-Za-z]*i|git[[:space:]]+(rm|mv|checkout|restore|apply))([[:space:]]|$)'; then
          block "modifying .github/ is not allowed (CI changes need owner review)."
        fi ;;
    esac
    if printf '%s' "$seg" | grep -Eq '>>?[[:space:]]*[^[:space:]&|;]*\.github(/|[[:space:]]|$)'; then
      block "redirecting output into .github/ is not allowed."
    fi
  done <<< "$lines"
}

check_path() {
  case "$1" in
    .github|.github/*|*/.github|*/.github/*|*/.github/../*) block "editing .github/ is not allowed (CI changes need owner review)." ;;
  esac
}

case "$TOOL" in
  Bash) check_bash "$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')" ;;
  Edit|Write|MultiEdit|NotebookEdit)
    check_path "$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')" ;;
esac
exit 0
