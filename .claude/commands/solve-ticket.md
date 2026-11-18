---
description: Implement a Jira ticket and/or instructions end-to-end (code, tests, Figma check, PR, CI, Jira update)
argument-hint: [JIRA-KEY] [instructions]
---

Solve the task described by **$ARGUMENTS** end-to-end, autonomously. Read and obey `AGENTS.md` strictly.

## Role

You are the **coordinator only**. Delegate all implementation, testing and fixing to Sonnet subagents (Agent tool, `model: "sonnet"`), in parallel when parts are independent (assign clear file ownership). Every subagent prompt must include the relevant `AGENTS.md` rules, the task context, Figma design context and the ports below. You run only git/gh/Jira/Figma/orchestration steps yourself.

## Arguments

If the first word matches `^[A-Z][A-Z0-9]+-[0-9]+$` it is the Jira key; the rest is additional instructions. Instructions override Jira on conflict. If there is neither, stop and ask.

## Environment

- Work in the current worktree (`claude --worktree`); a SessionStart hook has already set up `.env.local` and deps.
- Read `PORT`, `DB_PORT`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` from `.env.local`. Never hard-code 3000/5432.
- Bun is not installed: use `npm run <script>` (only the scripts allowed in `AGENTS.md`).
- Jira: Atlassian MCP tools (`getAccessibleAtlassianResources` for cloudId, `getJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment`). Figma: Figma MCP (`get_screenshot`, `get_design_context`, `get_metadata`). GitHub: `git` and `gh`.

## Pipeline

1. **Context**
   - With a key: fetch the issue (summary, description, acceptance criteria, comments, attachments, links), transition it to **In Progress**, collect Figma URLs (description, comments, remote links), then fetch Figma screenshots and design context for each frame (keep frame sizes).
   - Run `scripts/ai/rename-tab.sh "<KEY> <short title>"` (without a key: a short summary of the instructions).
2. **Sync**: `git fetch origin develop`, ensure the tree is clean, then create the branch from `origin/develop`: `git switch -c <branch> origin/develop` (or `git branch -m` the worktree's auto branch after resetting it to `origin/develop`). Name: `feat/<key-lowercase>-<slug>` or `fix/<key-lowercase>-<slug>`; without a key `feat/<slug>`.
3. **Implement**: write a brief plan, then spawn implementation subagent(s). DB schema changes: drizzle generate + migrate, never push.
4. **Test** (Sonnet subagents)
   - Unit tests (`*.test.ts`, colocated) and Playwright e2e (`tests/*.e2e.ts`) per `AGENTS.md` test conventions; run `npm run test` and `npm run test:e2e`.
   - If Figma screens exist: a subagent runs the app on the worktree port, captures Playwright screenshots of the relevant pages/states at the Figma frame viewport sizes, compares them with the Figma screenshots (layout, spacing, colors, typography, copy), fixes discrepancies and repeats until they match. It reports any remaining deviations.
5. **Quality gate**: `npm run lint`, `npm run check:types`, `npm run check:i18n`, `npm run build-local` must all pass. Loop: subagent fixes, then recheck.
6. **Commit and PR**
   - Commit per `AGENTS.md` Conventional Commits; with a key it is the first word: `GRO-12 feat: add shopping list sharing` (without: `feat: ...`). Logical commits are fine. End each commit message with the attribution trailer the session harness specifies.
   - `git push -u origin <branch>`, then `gh pr create --base develop`. Title uses the commit format. Body: summary, Jira link, what changed, tests, Figma check result (end with the harness-specified PR attribution line).
7. **CI loop** (max 5 iterations): `gh pr checks <pr> --watch`. On failure, read `gh run view <id> --log-failed`, delegate the fix to a Sonnet subagent, rerun the local quality gate, commit (`<KEY> fix: ...`), push, repeat. After 5 iterations stop and report what still fails.
8. **Jira** (with a key): add a comment with the PR link, 2-4 short bullets of what was done, and the CI status; transition to **In Review**. If CI fixes landed after the first comment, add an updated comment.
9. **Report** briefly to the user: PR URL, branch, CI status, Jira updated or not, ports used.

## Guardrails

- Never push to `develop` or `main`. Force-push only your own feature branch, and only when needed.
- Never run `drizzle push`.
- Never modify CI, or skip/disable tests, to make checks pass.
- Ask the user only when a requirement is ambiguous and truly blocking; otherwise decide and note the assumption in the PR.
