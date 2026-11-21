# AGENTS

@docs/ARCHITECTURE.md

The architecture doc defines the stack, folder map and recipes. Follow it whenever a task lacks technical specification. AGENTS.md wins on conflict.

## Principles
- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
Use the Sonnet model for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- Project agents in `.claude/agents/`: `developer` (implementation) and `tester` (unit/component/e2e tests and Figma visual check); delegate to them.
- After completing features (large or small), always run commands like lint, type check and next build to check code quality
- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Keep components/functions short; break down when it improves structure.
- TypeScript everywhere; no `any` unless isolated and necessary.
- No unnecessary `try/catch`. Avoid casting; use narrowing.
- Named exports only (no default exports, except Next.js pages).
- Absolute imports via `@/` unless same directory.
- Follow existing Oxlint/Oxfmt (Ultracite) setup; don't reformat unrelated code.
- Zod type-only: `import type * as z from 'zod';`.
- Let compiler infer return types unless annotation adds clarity.
- Options object for 3+ params, optional flags, or ambiguous args.
- Hypothesis-driven debugging: 1-3 causes, validate most likely first.

## Token efficiency
- Skip recaps unless the result is ambiguous or you need more input.

## Commands
Only these `npm run` scripts: `build-local`, `lint`, `check:types`, `check:deps`, `check:i18n`, `test`, `test:e2e`, `db:generate`, `db:migrate`, `storybook:test`.

## Git Commits
Conventional Commits: `type: summary` without scope. The summary should be a short, specific sentence that explains what changed and where or why, not a vague phrase. Types: `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`. `BREAKING CHANGE:` footer when needed. When working on a Jira task, prefix with its key: `GRO-12 feat: summary`.

## Env
All env vars validated in `Env.ts`; never read `process.env` directly.

## Styling
- Tailwind v4 utility classes. Reuse shared components. Responsive. No unnecessary classes.
- Always stick to figma styles, colors and typography

## React
- No `useMemo`/`useCallback` (React compiler handles it). Avoid `useEffect`.
- Single `props` param with inline type; access as `props.foo` (no destructuring).
- Use `React.ReactNode`, not `ReactNode`.
- Inline short event handlers; extract only when complex.

## Pages
- Default export name ends with `Page`. Props alias (if reused) ends with `PageProps`.
- Locale pages: `props: { params: Promise<{ locale: string }> }` → `await props.params` → `setRequestLocale(locale)`.
- Escape glob chars in shell commands for Next.js paths.
- Dashboard pages (sit behind auth); define meta once in layout, not in each page.

## i18n (next-intl)
- Never hard-code user-visible strings. Page namespaces end with `Page`.
- Server: `getTranslations`; Client: `useTranslations`.
- Context-specific keys (`card_title`, `meta_description`). Use `t.rich(...)` for markup.
- Use sentence case for translations.
- Error messages: short, no "try again" variants.

## JSDoc
- Start each block with `/**` directly above the symbol.
- Short, sentence-case, present-tense description of intent.
- Order: description → `@param` → `@returns` → `@throws` (only if it can throw).

## DB
- Whenever you make changes to the database schema, ALWAYS run `npm run db:generate` then `npm run db:migrate`
- After rebasing on develop, never hand-merge `migrations/**`: take develop's versions, keep your `Schema.ts` changes, and regenerate with `db:generate` and `db:migrate`
- New tables get deterministic seed data in `src/models/Seed.ts` (applied on every Vercel preview deployment and locally)
- NEVER run drizzle push!

## Tests
- `*.test.ts` for unit tests; `*.integ.ts` for integration tests; `*.e2e.ts` for Playwright tests.
- `*.test.ts` co-located with implementation; `*.integ.ts` in `tests/integration/`; `*.e2e.ts` in `tests/e2e/`.
- Top `describe` = subject; nested `describe` to group scenarios or contexts.
- `it` titles: short, third-person present, `verb + object + context`. Sentence case, no period.
- Omit "should/works/handles/checks/validates". State what, not how.
- Avoid mocking unless necessary.
