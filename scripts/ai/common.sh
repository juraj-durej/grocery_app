#!/usr/bin/env bash
# Shared helpers for scripts/ai/*.sh (sourced, bash 3.2 compatible).

die() { echo "✖ $*" >&2; exit 1; }
info() { echo "▶ $*"; }

# Main repo root, even when called from inside a worktree
MAIN_REPO="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"

AI_BASE_BRANCH="${AI_BASE_BRANCH:-develop}"
AI_ZELLIJ_SESSION="${AI_ZELLIJ_SESSION:-ai-tasks}"
export AI_BASE_BRANCH AI_ZELLIJ_SESSION
