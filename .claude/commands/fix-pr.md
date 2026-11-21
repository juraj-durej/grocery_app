---
description: Bring an existing PR back to green after develop moved (merge conflict, broken functionality, failing CI, review feedback)
argument-hint: <PR-NUMBER | JIRA-KEY | BRANCH> [instructions]
allowed-tools: Bash(scripts/ai/fix-pr.sh:*)
---

Repair the open PR described by **$ARGUMENTS** so it merges cleanly into `develop` and works together with everything already merged. Read and obey `AGENTS.md` strictly.

## Step 0: own Zellij tab

Check `git rev-parse --show-toplevel`:
- Not under `.claude/worktrees/` (started in the main repo): run `scripts/ai/fix-pr.sh $ARGUMENTS`, report the tab and worktree in one line, and **stop**. The agent in that tab does the work (it reuses the PR's worktree if it still exists).
- Under `.claude/worktrees/`: continue below.

## Role and environment

Same as `/solve-ticket`: you are the **coordinator only**; `developer` fixes code, `tester` fixes and runs tests and the Figma check, a fresh general-purpose Sonnet subagent reviews. Same environment rules (ports from `.env.local`, allowed `npm run` scripts, Jira/Figma MCP, `git`/`gh`). Same guardrails (hook-enforced).

## Arguments

The first word is the PR number (`12` or `#12`), a Jira key (the open PR whose title starts with it) or a branch name; resolve it with `gh pr view` / `gh pr list --search "<KEY> in:title"`. The rest are extra instructions; they override everything else on conflict.

## Pipeline

1. **Context**
   - `gh pr view <pr> --json number,title,body,headRefName,baseRefName,mergeable,mergeStateStatus,statusCheckRollup` plus `gh pr view <pr> --comments` and the review comments (`gh api repos/{owner}/{repo}/pulls/<pr>/comments`). The PR body holds the original technical plan, decisions and Figma check: this is your plan.
   - With a Jira key in the title: fetch the issue (acceptance criteria, Figma links) and the Figma design context for the affected frames.
   - Rename the tab: `scripts/ai/rename-tab.sh "<KEY or #PR> fix PR"`.
2. **Check out the PR branch**: `git fetch origin develop <branch>`. If the current branch is not `<branch>`, ensure a clean tree and run `git switch -C <branch> origin/<branch>`. If it is, ensure it equals `origin/<branch>` (`git status -sb`); never discard unpushed commits without asking.
3. **Diagnose what changed on develop**: `git log --oneline HEAD...origin/develop`, the PRs merged since the branch point (`gh pr list --state merged --base develop --search "merged:>=<branch point date>"`), and files touched by both sides (`git diff --name-only $(git merge-base HEAD origin/develop) origin/develop` vs the PR's files). Read the merged PRs' bodies to understand the other features. Summarize the overlap in a few lines.
4. **Clarify** (only if needed): if both features change the same behavior or UI in incompatible ways (same component, route, copy, schema column, Figma area), ask the user with `AskUserQuestion` as yes/no questions with your proposed resolution first, e.g. "GRO-14 already added a header filter; keep it and place this PR's sort button next to it?" (`Yes (Recommended)` / `No`). Max 4 per call; each question stands on its own. Mechanical conflicts are not questions; resolve them.
5. **Rebase**: `git rebase origin/develop` with the `/solve-ticket` step 8 conflict rules:
   - `migrations/**`: never hand-merge; take develop's, keep the merged `src/models/Schema.ts`, rerun `npm run db:generate` and `npm run db:migrate`.
   - `src/locales/*.json`: union of keys, then `npm run check:i18n`.
   - `src/models/Schema.ts` and `src/models/Seed.ts`: keep both sides' tables, columns and seed rows.
   - Code: keep **both** features working. Delegate non-trivial conflict resolution to `developer` with both PRs' plans and the diff of each side.
   - Never drop, skip or weaken develop's tests or code to make yours pass.
6. **Repair**: run the full quality gate (`/solve-ticket` step 7) and the **full** `npm run test:e2e` (not only affected flows: another feature landed). `developer` fixes broken behavior, `tester` updates this PR's tests when develop legitimately changed behavior. Re-run the Figma check (max 3 iterations) for frames whose components or styles changed in the rebase. Then the independent review on the final diff vs `origin/develop`. Loop until green.
7. **Extra work**: address unresolved review comments and the extra instructions, as part of the same loop.
8. **Push**: commit fixes (`<KEY> fix: <what>`; attribution trailer per harness), then `git push --force-with-lease origin <branch>` (only this PR's branch).
9. **CI and preview**: same as `/solve-ticket` steps 10 (max 5 iterations) and the Vercel preview smoke test. Confirm `gh pr view <pr> --json mergeable,mergeStateStatus` is `MERGEABLE` / `CLEAN` (or only waiting for review).
10. **Report back**
    - PR comment: what changed on develop, how conflicts were resolved, decisions from step 4, what was fixed, test and CI status, preview URL. Update the PR body (`gh pr edit`) with a "Rebase notes" section and any new decisions.
    - Jira (with a key): short comment with the same summary; keep the issue **In Review**.
    - To the user: PR URL, CI status, mergeable state, anything still open.
