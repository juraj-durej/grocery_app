---
description: Implement a Jira ticket end-to-end (code, tests, Figma check, PR, Jira update)
argument-hint: <JIRA-KEY>
---

Implement Jira ticket **$ARGUMENTS** end-to-end, autonomously. Follow `AGENTS.md` strictly (you are the coordinator; delegate implementation to Sonnet sub-agents, run independent parts in parallel).

## Environment
- You run inside a dev container, in a git worktree already on the task branch (`git branch --show-current`). Don't create or switch branches.
- Helpers on PATH: `jira` (Jira REST), `figma-shot` (export a Figma node as PNG), `gh` (authenticated via `GH_TOKEN`).
- MCP: `playwright` (headless Chromium) and `figma` (`get_figma_data`, `download_figma_images`).
- Base branch: `$AI_BASE_BRANCH` (fallback `development`). Database: embedded PGlite only — never Docker/remote Postgres.
- Artifacts (screenshots, reports): `/tmp/ai-artifacts/` — never commit them.

## 1. Understand the ticket
1. `jira get $ARGUMENTS` — read title, description, acceptance criteria, comments, Figma links.
2. If status isn't `$JIRA_STATUS_IN_PROGRESS`, run `jira transition $ARGUMENTS "$JIRA_STATUS_IN_PROGRESS"`.
3. For every Figma link: call `get_figma_data` (layout, colors, typography, spacing, radii) and `figma-shot "<url>"` to get the reference PNG. Read the PNG.
4. Explore the relevant code, then write a short plan (files, components, DB changes, tests). Don't ask for confirmation — proceed. Only stop and ask if the ticket is contradictory or impossible.

## 2. Implement
- Delegate coding to sub-agents (model: sonnet) with precise briefs incl. the Figma values (exact colors, font sizes/weights/line-heights, spacing, radii) and the relevant `AGENTS.md` rules.
- Reuse existing components and Tailwind tokens; add new tokens only if Figma requires them.
- All user-visible strings via next-intl in every locale under `src/locales`.
- DB schema change → `npm run db:generate` then `npm run db:migrate` (with PGlite running). Never `drizzle push`.

## 3. Tests
- Unit tests `*.test.ts` co-located; Playwright tests `tests/**/*.e2e.ts` covering the acceptance criteria.
- Run `bun run test` and `bun run test:e2e` — all must pass.

## 4. Verify the UI against Figma (skip only if the ticket has no UI)
1. Start the app in the background (allowed exception to the script list): `npm run dev > /tmp/ai-artifacts/dev.log 2>&1 &` and wait for `http://localhost:3000`.
2. With Playwright MCP: `browser_resize` to the Figma frame width (and a mobile width if a mobile design exists), `browser_navigate` to the page, `browser_take_screenshot`.
3. Compare the screenshot with the Figma PNG side by side (read both images): layout, spacing, alignment, colors, typography, icons, states.
4. Use `browser_evaluate` with `getComputedStyle` on key elements to check exact values (color, background, font-family/size/weight, line-height, padding/gap, border-radius) against `get_figma_data`.
5. Fix mismatches and repeat (max 5 rounds). Record the remaining differences (if any) and why.
6. Stop the dev server.

## 5. Quality gate
Run and fix until all pass: `bun run lint`, `bun run check:types`, `bun run check:deps`, `bun run check:i18n`, `bun run test`, `bun run build-local`.

## 6. Commit, push, PR
1. Review `git status` / `git diff` — no secrets, no `.env*.local`, no artifacts, no unrelated changes.
2. Commit with Conventional Commits per `AGENTS.md` (`type: summary`, no scope); split into logical commits if useful. Never `--no-verify`; fix hook failures.
3. `git push -u origin HEAD`. Never force-push; never push to `$AI_BASE_BRANCH`/`main`.
4. `gh pr create --base "${AI_BASE_BRANCH:-development}" --title "<type>: <summary>" --body-file <file>` where the body contains: `Jira: $JIRA_BASE_URL/browse/$ARGUMENTS`, summary of changes, tests added, Figma verification result, how to test.

## 7. Update Jira
1. Write `/tmp/ai-artifacts/jira-comment.md` (plain text, `- ` bullets): what was done, key files, tests, Figma check result, notes/open points.
2. `jira comment $ARGUMENTS /tmp/ai-artifacts/jira-comment.md "<PR_URL>"`
3. `jira link $ARGUMENTS "<PR_URL>" "PR: <PR title>"`
4. `jira transition $ARGUMENTS "$JIRA_STATUS_IN_REVIEW"`

Finish with a 3–5 line summary: PR URL, Jira status, anything needing human attention.
