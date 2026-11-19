---
description: Implement a Jira ticket and/or instructions end-to-end (code, tests, Figma check, PR, CI, Jira update)
argument-hint: [--plan] [JIRA-KEY] [instructions]
allowed-tools: Bash(scripts/ai/start-task.sh:*)
---

## Step 0: own Zellij tab

Every task runs in its own Zellij tab and worktree. Check `git rev-parse --show-toplevel`:
- Not under `.claude/worktrees/` (you were started in the main repo): run `scripts/ai/start-task.sh $ARGUMENTS`, report the new tab and worktree in one line, and **stop**. The agent in the new tab does the work.
- Under `.claude/worktrees/`: continue below.

Solve the task described by **$ARGUMENTS** end-to-end, autonomously. Read and obey `AGENTS.md` strictly.

## Role

You are the **coordinator only**. Delegate implementation and fixes to `subagent_type: "developer"` and testing plus the Figma comparison to `subagent_type: "tester"` (project agents in `.claude/agents/`, Sonnet), in parallel when parts are independent (assign clear file ownership). Every subagent prompt must include the technical plan, the relevant `docs/ARCHITECTURE.md` sections/recipes, the `AGENTS.md` rules, the task context, Figma design context and the ports below. You run only git/gh/Jira/Figma/orchestration steps yourself.

## Arguments

Strip the flag `--plan` (anywhere) and remember it (plan-only mode, see Plan). If the first remaining word matches `^[A-Z][A-Z0-9]+-[0-9]+$` it is the Jira key; the rest is additional instructions. Instructions override Jira on conflict. If there is neither, stop and ask.

## Environment

- Work in the current worktree (`claude --worktree`); a SessionStart hook has already set up `.env.local` and deps.
- Read `PORT`, `DB_PORT`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` from `.env.local`. Never hard-code 3000/5432.
- Bun is not installed: use `npm run <script>` (only the scripts allowed in `AGENTS.md`).
- Jira: Atlassian MCP tools (`getAccessibleAtlassianResources` for cloudId, `getJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment`). Figma: Figma MCP (`get_screenshot`, `get_design_context`, `get_metadata`). GitHub: `git` and `gh`.

## Pipeline

1. **Context**
   - With a key: fetch the issue (summary, description, acceptance criteria, comments, attachments, links), transition it to **In Progress**, collect Figma URLs (description, comments, remote links), then fetch Figma screenshots and design context for each frame (keep frame sizes).
   - Name the tab right away with `scripts/ai/rename-tab.sh "<name>"`, max 30 chars: with a key `<KEY> <short title>` (2-4 words from the Jira summary, e.g. `GRO-12 Shopping list`); without a key a 2-4 word title of the instructions (e.g. `Category filter`).
2. **Sync**: `git fetch origin develop`, ensure the tree is clean, then create the branch from `origin/develop`: `git switch -c <branch> origin/develop` (or `git branch -m` the worktree's auto branch after resetting it to `origin/develop`). Name: `feat/<key-lowercase>-<slug>` or `fix/<key-lowercase>-<slug>`; without a key `feat/<slug>`.
3. **Plan (technical design)**: Jira tickets often hold only Figma designs and no spec, so design it yourself. Read `docs/ARCHITECTURE.md` and map the ticket + Figma screens to:
   - routes/pages (public vs protected)
   - components (reuse existing vs new, with file paths)
   - data model changes (Drizzle schema)
   - server actions and validation (Zod schemas)
   - auth/authorization needs
   - i18n keys (all locales)
   - design tokens to use/add
   - tests to write

   Rules: use only the stack from `ARCHITECTURE.md`; no new dependency unless unavoidable (justify it in the PR); list assumptions explicitly. Keep the plan in memory and pass it verbatim to every subagent; it goes into the PR body.
   - **Clarify before implementing** (always, also in plan-only mode): compare the ticket, comments, instructions and every Figma frame and list everything inconsistent or unclear, for example ticket vs Figma differences, frames that disagree, missing states (empty, error, loading), missing mobile frames, unclear behavior, data or permissions, copy without a translation source, or a requirement that conflicts with `ARCHITECTURE.md`.
     - If there is anything, ask the user with the `AskUserQuestion` tool **before any implementation**. Phrase each point as a yes/no question with your proposed default as the first option, e.g. "Figma shows 3 columns but the ticket says 4. Use Figma's 3?" with options `Yes (Recommended)` / `No`. Use a short multiple choice only when yes/no can't express it. Max 4 questions per call; call again if there are more. Each question must stand on its own (name the screen or field).
     - Wait for the answers, update the plan, and record each answer in the plan as a decision (it goes into the PR body). Never start step 4 with an open question.
     - If everything is clear and consistent, don't ask anything; continue immediately.
   - **Plan-only mode** (`--plan`): stop here. Print the plan, post it as a Jira comment if a key exists (prefixed "Proposed technical plan"), and wait for the user to approve or adjust in the session. On approval continue with the pipeline using the adjusted plan.
4. **Implement**: spawn `developer` subagent(s) following the plan. DB schema changes: `npm run db:generate` then `npm run db:migrate`, never push.
5. **Test** (`tester` subagent)
   - Unit tests (`*.test.ts`, colocated), component tests, and Playwright e2e (`tests/e2e/*.e2e.ts`) / integration (`tests/integration/*.integ.ts`) per `AGENTS.md` test conventions; run `npm run test` and `npm run test:e2e`.
   - **Figma check** (if Figma screens exist), per frame:
     - Seed/fixture data so the rendered page shows the same content as the Figma frame. Capture Playwright screenshots at the exact Figma frame viewport size, with fonts loaded and animations disabled.
     - Compare with the checklist: layout/spacing, colors (token names), typography (`text-*` utilities), copy, icons, states. Pass = no checklist item fails; sub-pixel/antialiasing differences are ignored.
     - Hard cap: max 3 fix iterations (fixes delegated to `developer`). After that stop and list the remaining deviations.
     - Fixes use existing tokens/utilities only; no arbitrary values (`w-[13px]`, `text-[#...]`) to force a match. If Figma uses a value with no token, add a token per `ARCHITECTURE.md` 4.8 or record it as a deviation.
     - Save Figma vs implementation screenshots side by side under the gitignored `test-results/figma-check/` (never commit them) and report a table: frame, viewport, result, deviations.
6. **Review**: spawn a fresh general-purpose Sonnet subagent (independent of `developer`/`tester`) to review the diff against the plan, the `ARCHITECTURE.md` definition of done and `AGENTS.md`: wrong tech, missing i18n/validation/authz/tests, hard-coded strings/colors. Dispatch fixes to `developer` for every finding.
7. **Quality gate** (mirrors CI): `npm run lint`, `npm run check:types`, `npm run check:deps`, `npm run check:i18n`, `npm run test`, `npm run storybook:test` (if stories changed), `npm run build-local`, and `npm run test:e2e` for affected flows must all pass. Loop: `developer` fixes, then recheck. Do not open the PR until the gate passes.
8. **Rebase on develop**: make local commits first (rebase needs a clean tree; message rules in step 9), then `git fetch origin develop`, then `git rebase origin/develop`. Conflict rules:
   - `migrations/**` (SQL, `meta/_journal.json`, snapshots): never hand-merge. Take develop's versions (drop your generated migration files and journal/snapshot changes), keep your `src/models/Schema.ts` changes merged with develop's, then rerun `npm run db:generate` and `npm run db:migrate` for a fresh migration on top.
   - `src/locales/*.json`: keep both sides' keys (union), valid JSON, then `npm run check:i18n`.
   - `src/models/Schema.ts`: keep both sides' tables/columns.
   - After the rebase, rerun the full quality gate. Push with `--force-with-lease`, only to your own feature branch.
9. **Commit and PR**
   - Commit per `AGENTS.md` Conventional Commits; with a key it is the first word: `GRO-12 feat: add shopping list sharing` (without: `feat: ...`). Logical commits are fine. End each commit message with the attribution trailer the session harness specifies.
   - `git push -u origin <branch>`, then `gh pr create --base develop`. Title uses the commit format. Body: summary, Jira link, what changed, **Technical plan & assumptions** (plan, assumptions, any new dependency with justification), tests, **Figma check** section (the per-frame table and remaining deviations; end with the harness-specified PR attribution line).
10. **CI loop** (max 5 iterations): `gh pr checks <pr> --watch`. On failure, read `gh run view <id> --log-failed`, delegate the fix to `developer`, rerun the local quality gate, commit (`<KEY> fix: ...`), push, repeat. After 5 iterations stop and report what still fails.
    - **Vercel preview**: once checks pass, wait for the Vercel deployment check (`gh pr checks`), read the preview URL (Vercel bot comment via `gh pr view --comments`, or `gh api repos/{owner}/{repo}/deployments` status `environment_url`). Run an e2e smoke test against it via `tester` (`PLAYWRIGHT_BASE_URL=<url>`; previews are public). Add the preview URL to the PR body (`gh pr edit`) and the Jira comment.
11. **Jira** (with a key): add a comment with the PR link, 2-4 short bullets of what was done, and the CI status; transition to **In Review**. If CI fixes landed after the first comment, add an updated comment.
12. **Report** briefly to the user: PR URL, branch, CI status, Jira updated or not, ports used. If the PR later conflicts with or breaks after another merge into develop, the user runs `/fix-pr <PR>`.

## Guardrails

- Guardrails are enforced by a PreToolUse hook (`scripts/ai/guard.sh`) and permission deny rules in `.claude/settings.json`. A blocked command means change approach; never work around it.
- Never push to `develop` or `main`. Force-push only your own feature branch, and only when needed.
- Never run `drizzle push`.
- Never modify CI, or skip/disable tests, to make checks pass.
- Ask the user only in the clarify step (before implementation), as yes/no questions. After implementation starts, decide minor gaps yourself and note the assumption in the PR; stop and ask only for something truly blocking.
