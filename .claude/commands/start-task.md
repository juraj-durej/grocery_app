---
description: Start an AI agent for a Jira task or free-text instructions (worktree + Zellij tab)
argument-hint: [--plan] [JIRA-KEY] [instructions]
allowed-tools: Bash(scripts/ai/start-task.sh:*)
---

Run `scripts/ai/start-task.sh $ARGUMENTS` from the repo root and report briefly the created Zellij tab and worktree (or any error). Don't do anything else.

The new tab is named by the Jira key (the agent renames it to `<KEY> <short title>` once it reads the ticket) or, without a key, by a short title from the instructions.
