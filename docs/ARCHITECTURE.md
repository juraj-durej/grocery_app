# ARCHITECTURE

Rules for implementing tickets that contain only Figma designs and no technical spec. Versions are taken from `package.json`.

## 1. Purpose and precedence

- Treat this file as the technical spec for every ticket. The ticket defines the UI and behavior; this file defines the technology, location and pattern.
- Precedence: `AGENTS.md` > this file > upstream or third-party advice. On conflict, follow `AGENTS.md` and flag it in the PR.
- Reuse existing dependencies, components, helpers and patterns before writing new ones. Search `src/` first.
- Add a dependency only when no installed package solves it. Justify it in the PR description and run `check:deps`.
- Do not introduce alternatives to the chosen stack:
  - Auth: no next-auth, Clerk, Auth0, `@supabase/auth-helpers-*`.
  - Data: no Prisma, TypeORM, Supabase query builder for app tables (use Drizzle), no axios/SWR/React Query for data a Server Component can load.
  - Styling: no styled-components, Emotion, CSS modules, Sass, inline `style` for static values, or other UI kits (MUI, Chakra, Mantine, Ant Design, Bootstrap). shadcn/ui is the component library and `lucide-react` the icon library (no inline SVG icon set, no other icon packs).
  - Forms and validation: no Formik, Yup, Joi, valibot.
  - i18n: no i18next, react-intl, hard-coded strings.
  - Logging: no `console.*` in app code (use LogTape).
  - Tests: no Jest, Cypress, React Testing Library.
  - Tooling: no ESLint/Prettier/Husky (project uses Oxlint/Oxfmt/Lefthook).
- Demo boilerplate code (counter, portfolio, about, marketing layout, demo components, `BaseTemplate`) was removed in TASK-131. The home page is the four-slide welcome carousel (`WelcomeSlides` server component, native CSS scroll-snap; the small client leaf `SlidesCarousel` tracks the active slide for the `SlideDots` page dots via `getActiveSlideIndex` in `src/utils/Slides.ts`).
- `AppConfig.name` is still the placeholder `Nextjs Starter`. Do not hard-code the app name elsewhere; read `AppConfig`.
- Unknown requirement or conflicting design: choose the simplest option consistent with this file, state the assumption in the PR.

## 2. Tech stack

| Concern | Technology (version) | Where | Key rule |
| --- | --- | --- | --- |
| Framework | Next.js 16.4 App Router, Turbopack | `src/app`, `next.config.ts` | Server Components by default |
| UI runtime | React 19.2 + React Compiler (prod only) | `src/components` | No `useMemo`/`useCallback`; avoid `useEffect` |
| Language | TypeScript 7, strict | `tsconfig.json` | `@/*` imports; no `any` |
| Styling | Tailwind CSS 4.3 (CSS-first) | `src/styles/global.css` | Utilities only; shadcn semantic CSS variables in `:root`/`.dark` mapped via `@theme inline` |
| Auth | Supabase Auth via `@supabase/ssr` 0.12 | `src/libs/SupabaseServer.ts`, `src/proxy.ts`, `src/actions/AuthActions.ts` | `getUser()` for authorization, never `getSession()` |
| Database | Postgres + Drizzle ORM 0.45 / drizzle-kit 0.31 (`pg`); PGlite locally (socket) or in-process in-memory PGlite (`DB_MODE=pglite`, Vercel) | `src/models/Schema.ts`, `src/models/Seed.ts`, `src/libs/DB.ts`, `src/utils/DBConnection.ts`, `migrations/` | Server-only; generate + migrate, never push |
| Validation | Zod 4.4 | `src/validations` | One schema shared by client and server |
| Component library | shadcn/ui 4.23 CLI (style `radix-vega`, `radix-ui` 1.8 primitives, `class-variance-authority` 0.7, `tailwind-merge` 3.7 + `clsx` 2.1 via `cn`, `tw-animate-css`) | `src/components/ui`, `components.json`, `src/utils/Cn.ts` | Generated primitives; compose, do not rebuild; variants via CVA |
| Icons | lucide-react 1.75 | imported where used | Only icon library |
| Toasts | sonner 2.0 (shadcn `Toaster`) | `src/components/ui/sonner.tsx` | `toast()` from `sonner`; mount `<Toaster />` once in the root layout |
| Forms | react-hook-form 7.85 + `@hookform/resolvers` 5.9 + shadcn `Field` | `src/components` | `zodResolver` with the shared schema; layout with `Field*` components (shadcn `form` is deprecated) |
| i18n | next-intl 4.13 (`en`, `fr`; `as-needed` prefix) | `src/locales`, `src/libs/I18n*.ts` | Every string a key; update all locales |
| Env | `@t3-oss/env-nextjs` 0.13 | `src/libs/Env.ts` | No raw `process.env` |
| Security | Arcjet 1.10 (shield, bot detection) | `src/libs/Arcjet.ts`, `src/proxy.ts` | Validate and authorize all input |
| Logging | LogTape 2.3 (+ Better Stack sink) | `src/libs/Logger.ts` | `logger` from `@/libs/Logger` |
| Monitoring | Sentry 10.70 (+ Spotlight in dev) | `src/instrumentation*.ts`, `src/app/global-error.tsx` | Do not wrap errors in silent catches |
| Unit/UI tests | Vitest 4.1 (node `unit`, browser `ui` projects), `vitest-browser-react` | `*.test.ts(x)` next to source | No mocking unless necessary |
| E2E/integration | Playwright 1.62 | `tests/e2e/*.e2e.ts`, `tests/integration/*.integ.ts` | Cover each new user flow |
| Component dev | Storybook 10.5 (`@storybook/nextjs-vite`, a11y addon) | `*.stories.tsx`, `.storybook/` | Story per reusable component |
| Quality | Oxlint + Ultracite preset, Oxfmt, Knip, i18n-check, Lefthook, Commitlint | `oxlint.config.ts`, `oxfmt.config.ts`, `knip.config.ts`, `lefthook.yml` | Must pass before PR |
| Test data | `@faker-js/faker` | tests only | Never in app code |

## 3. Folder map

- `src/app/[locale]/` all UI routes. Root `layout.tsx` validates locale and provides `NextIntlClientProvider`.
  - `page.tsx` home page (`WelcomeSlides` carousel, `SlidesCarousel` client leaf, `SlideDots`).
  - Add public pages as route groups (for example `(marketing)/`) and protected pages under `(auth)/dashboard/` (protected by `src/proxy.ts`).
  - Auth pages (sign in, sign up) are not implemented yet; the proxy redirects unauthenticated users to `/sign-in`. Create them under a new `(auth)`-style public route group when a ticket asks (see section 5, recipe 2).
- `src/app/api/` route handlers, only for external consumers, webhooks or non-form HTTP clients. Not locale-prefixed.
- `src/app/{robots,sitemap}.ts`, `global-error.tsx` app-level special files.
- `src/actions/` server actions, one file per domain: `AuthActions.ts`, `<Domain>Actions.ts`.
- `src/components/ui/` shadcn/ui primitives (`button`, `input`, `label`, `card`, `badge`, `checkbox`, `dialog`, `dropdown-menu`, `field`, `separator`, `skeleton`, `sonner`). Generated by the CLI, kebab-case filenames (accepted exception), owned by us: editing is allowed but keep the public API (props, `data-slot`, variant names). Knip treats them as entries.
- `src/components/` app components composed from `ui/` primitives, one component per PascalCase file (e.g. `ProductCard.tsx`). Subfolders only when a component has parts.
- `src/templates/` page-level shells composed from components (none yet).
- `src/libs/` third-party wiring and singletons (`DB.ts`, `Env.ts`, `Logger.ts`, `Arcjet.ts`, `SupabaseServer.ts`, `I18n*.ts`). PascalCase files.
- `src/models/Schema.ts` the single Drizzle schema file; `src/models/Seed.ts` deterministic seed data for every table.
- `src/validations/<Name>Validation.ts` Zod schemas, exported as `<Name>Validation`.
- `src/utils/` pure helpers and config (`AppConfig.ts`, `Helpers.ts`, `DBConnection.ts`, `Cn.ts` with `cn()`, `Slides.ts` with `getActiveSlideIndex`).
- `src/types/` shared types (`I18n.ts`).
- `src/locales/{en,nb}.json` message catalogs.
- `src/styles/global.css` Tailwind entry, shadcn theme variables and design tokens.
- `src/hooks/` (create if needed) client hooks; tests for hooks run in the `ui` project.
- `migrations/` generated SQL; never hand-edit.
- `public/` static assets. `tests/e2e`, `tests/integration` Playwright. `docs/` documentation.
- Naming: PascalCase files for components (except generated `src/components/ui/*`), libs, actions, validations; `use*` camelCase for hooks; `*.test.ts(x)`, `*.stories.tsx` beside the source.
- Named exports only; default export only for Next.js special files (pages, layouts, `proxy`, `global-error`).
- Unused files and exports fail Knip. Delete dead code; do not leave placeholders.

## 4. Per-technology rules

### 4.1 Next.js App Router

- Default to Server Components. Add `'use client'` only for state, effects, event handlers, browser APIs or client-only libs (react-hook-form). Keep the client boundary at the smallest leaf component.
- `params`, `searchParams`, `cookies()`, `headers()` are async in Next 16: always `await`. Page signature and locale handling per `AGENTS.md`.
- Every page and layout under `[locale]` calls `setRequestLocale(locale)` after awaiting params (static rendering with next-intl).
- Fetch data directly in Server Components (Drizzle via `@/libs/DB`, Supabase via `createSupabaseServerClient`). Do not fetch your own API route from a Server Component.
- Mutations: server actions in `src/actions/*Actions.ts` (`'use server'` at top). Use route handlers (`src/app/api/**/route.ts`) only for webhooks or external clients.
- Metadata: `generateMetadata` using `getTranslations` (in a dashboard layout). Dashboard metadata lives in the layout only.
- Add `loading.tsx` for routes with slow data, `error.tsx` for recoverable segment errors, `not-found.tsx` and `notFound()` for missing resources. Error and loading copy goes through i18n.
- Navigation: import `Link`, `redirect`, `useRouter`, `usePathname` from `@/libs/I18nNavigation`, never from `next/link` or `next/navigation` (except `notFound`). Use locale-less hrefs (`/dashboard`).
- Images: `next/image` with explicit `width`/`height` or `fill` + `sizes`; static assets in `public/`. Always meaningful `alt` (translated) or `alt=""` if decorative.
- Fonts: `next/font` in the root layout, wired to a Tailwind token. No `<link>` font tags.
- `src/proxy.ts` replaces `middleware.ts` (Next 16). It runs Arcjet, i18n routing, and Supabase session refresh for `/dashboard` only. To protect new routes, extend `isProtectedRoute`; keep the matcher excluding `_next`, `api`, static files.
- Caching: no `use cache` / `cacheComponents` configured. Do not enable them; do not add `export const dynamic`/`revalidate` without reason. Call `router.refresh()` or `revalidatePath` after mutations.
- Never add `middleware.ts`.

### 4.2 React 19

- Function components only; single `props` param, no destructuring (see `AGENTS.md`).
- `ref` is a regular prop: no `forwardRef`. Context: `<Context value>` not `.Provider`.
- Prefer `useActionState` + `useFormStatus` / `useTransition` for server-action forms without client validation; use react-hook-form when the form needs field-level client validation (4.6).
- Derive state during render; no `useEffect` for derived data or fetching. Lists need stable `key`s (never index for dynamic lists).
- Use `React.ReactNode`, `React.ComponentProps<'button'>` for passthrough props.

### 4.3 TypeScript

- `strict`; no `any`, no `as` casts, no non-null `!`. Narrow with guards, `satisfies`, Zod `safeParse`.
- Infer types from sources: `typeof table.$inferSelect`, `z.infer<typeof Schema>`; do not duplicate shapes.
- `type` aliases for props (`type FooProps = {...}`); `import type` for types.
- Run `check:types` after any change.

### 4.4 Supabase Auth

- Server client: `createSupabaseServerClient()` from `@/libs/SupabaseServer` in Server Components, actions and route handlers. Uses `@supabase/ssr` `createServerClient` with `getAll`/`setAll` only.
- Never use `get`/`set`/`remove` cookie methods or `@supabase/auth-helpers-*`.
- Authorization on the server: `const { data: { user } } = await supabase.auth.getUser()`. Never trust `getSession()` on the server. Use `user.id` to scope DB queries.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` via `Env`. Use the publishable key only; never ship a service-role key to the client or to `NEXT_PUBLIC_*`.
- Do not run code between `createServerClient` and `getUser()` in `proxy.ts`; keep returning the i18n response that carries refreshed cookies.
- Auth actions (`signInWithPassword`, `signUp`, OAuth, magic link, `signOut`) live in `src/actions/AuthActions.ts`, validate input with Zod, then redirect with `redirect` from `@/libs/I18nNavigation` and `locale: await getLocale()` (see `signOut`).
- Client-side Supabase (`createBrowserClient`) is not set up. Add `src/libs/SupabaseBrowser.ts` only if a ticket needs realtime or client-only auth, using the same env vars.
- Business data lives in Postgres via Drizzle, not Supabase tables via supabase-js. Link rows to the user with a `userId` uuid column holding `auth.users.id`.
- Double-check each protected page/action: the proxy is a first gate; actions must still call `getUser()` and reject when null.

### 4.5 Drizzle and Postgres

- Schema only in `src/models/Schema.ts`. Pattern: `pgTable`, snake_case DB column names, camelCase TS keys, `createdAt`/`updatedAt` with `defaultNow()` and `$onUpdate`.
- Workflow after every schema change: `db:generate` then `db:migrate`; commit the generated `migrations/` files. Never `drizzle-kit push`; never edit generated SQL by hand. After a rebase on develop, drop your generated migration files and regenerate (`db:generate`, `db:migrate`); never hand-merge `migrations/**`.
- Access the DB only from server code through `import { db } from '@/libs/DB'`. Never import it into a `'use client'` file.
- Use Drizzle query builder / `eq`, `and` etc. Use `sql` template only for expressions the builder lacks; never concatenate user input into SQL.
- Use `db.transaction` for multi-statement writes that must be atomic. Add indexes and foreign keys for lookup/relationship columns; unique constraints for natural keys.
- Select only needed columns; paginate lists; avoid N+1 by joining.
- Local DB is PGlite (`db-server:file`, started by `dev`); production is Postgres through `DATABASE_URL`. Write portable Postgres only.
- `DB_MODE` (`postgres` default, or `pglite`) selects the driver in `DBConnection.ts`. `pglite` creates an in-memory PGlite in the server process, runs the migrations and `seedDatabase` (`src/models/Seed.ts`) once per instance; `ensureDbReady()` from `@/libs/DB` resolves when done (awaited in `instrumentation.ts` `register()` and before queries). `DATABASE_URL` is required only for `postgres`.
- Every new table gets deterministic, idempotent, hand-written seed data in `src/models/Seed.ts` in the same PR (no faker).
- Enable Supabase RLS only if tables are exposed to supabase-js; with Drizzle server access, enforce ownership in queries.

### 4.6 Zod 4 and react-hook-form

- Schemas in `src/validations/<Name>Validation.ts`, exported as `<Name>Validation`. The same schema validates the form (client) and the action/handler (server).
- Import: `import * as z from 'zod'` where runtime schema is built; `import type * as z from 'zod'` where only types are used (`AGENTS.md`).
- Zod 4 API: `z.email()`, `z.url()`, `z.uuid()` top-level formats; `z.treeifyError(error)` / `z.flattenError(error)` instead of `error.format()`; `error:` option for messages. Avoid deprecated Zod 3 forms such as `z.string().email()`.
- Put i18n keys, not English text, in schema messages (e.g. `z.string().min(8, { error: 'password_min' })`) and translate at render time; or map `issue.code`/path to keys.
- Always `safeParse` on the server and return a typed result (`{ ok: false, fieldErrors }`) from actions. Never trust client-validated data.
- Forms: `useForm({ resolver: zodResolver(Schema), defaultValues })`, `form.handleSubmit`, `register`, `formState.errors`, `isSubmitting`. Call a server action from the submit handler (preferred over `fetch` to an API route).
- UI: build form layout with shadcn `Field`, `FieldLabel`, `FieldError`, `FieldDescription` plus `Input`/`Checkbox`; wire to react-hook-form with `Controller` (or `register`) and set `data-invalid` on `Field` and `aria-invalid` on the control. Do not add the deprecated shadcn `form` component.
- Every input has a visible `<label htmlFor>`, `aria-invalid` and `aria-describedby` on error, error text translated, submit disabled while submitting.

### 4.7 next-intl

- Config: `src/libs/I18n.ts`, routing in `src/libs/I18nRouting.ts`, locales in `AppConfig.i18n`. Server `getTranslations({ locale, namespace })`, client `useTranslations(namespace)`.
- Keys in `src/locales/en.json` are namespaced by component or page (`DashboardLayout`, `IndexPage`); page namespaces end with `Page`. Keys are snake_case and context-specific (`meta_title`, `button_increment`, `error_increment_range`). Use ICU placeholders (`{year}`), `t.rich` for markup, and plural syntax for counts.
- Add every key to all locale files (`en.json` and `nb.json`) in the same change, then run `check:i18n` (detects missing, unused, invalid keys). Crowdin syncs translations later; still provide a real Norwegian Bokmål string, not a copy of English.
- Format dates, numbers, currency with `useFormatter` / `getFormatter`, never `toLocaleString` with hard-coded locales.
- Add a new locale: update `AppConfig.i18n.locales`, create `src/locales/<code>.json`, update `crowdin.yml` if needed.
- Client components receive messages through the root `NextIntlClientProvider`; do not pass a custom `messages` subset.

### 4.8 Tailwind CSS 4 and Figma

- Tailwind is configured CSS-first in `src/styles/global.css` (`@import 'tailwindcss'`, layer order declared). There is no `tailwind.config.*`; do not create one. Theme variables are shadcn semantic CSS variables (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, `--radius`, ...) declared in `:root` (and `.dark`) and exposed to Tailwind by `@theme inline` (`--color-primary: var(--primary)`). Extra tokens (brand scale, fonts, text sizes, spacing, breakpoints) go in `@theme { --color-brand-*, --font-*, --text-*, ... }`.
- Tokens live in `src/styles/global.css`: shadcn semantic variables in `:root`, brand/text/typography tokens in `@theme`. For new Figma variables, read them with the Figma MCP `get_variable_defs`, map them to the semantic variable (`--primary`, ...) or add a token with a name mirroring Figma. Reuse existing tokens; never duplicate a value under a second name. See the token reference in 4.8.2.
- Use token-backed utilities (`bg-brand-dark`, `text-title-md`). No arbitrary values (`w-[13px]`, `text-[#123456]`) when a token or scale step exists; if Figma has a one-off value, add a token or justify it in the PR.
- Exception: welcome slide photo crops use commented arbitrary percentage classes (`-left-[48.55%]`) to reproduce the Figma crop boxes.
- Existing demo components use the default Tailwind palette (`text-gray-700`, `bg-blue-500`). Do not copy those colors into new work; use Figma tokens.
- Mobile-first: base classes for mobile, `sm: md: lg:` to scale up. Check at 375, 768 and 1280 px. No horizontal scroll.
- Class names are static strings. For variants, use a typed lookup object; do not build classes dynamically (`bg-${x}`) because Tailwind cannot detect them. Prefer `gap`/`space-*` over margin hacks, `flex`/`grid` over absolute positioning, `rem`-based sizes.
- Dark mode only if the design has it. Figma has no dark mode, so the `.dark` variable block was removed; `@custom-variant dark` stays only because shadcn components reference `dark:` classes. Dark mode is not designed.
- Accessibility baseline: semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, visible `focus-visible` styles, WCAG AA contrast, 44 px touch targets, `button` for actions and `a`/`Link` for navigation, labels for inputs, `aria-label` for icon-only controls, respect `prefers-reduced-motion`.
- Icons: `lucide-react` only (`import { XIcon } from 'lucide-react'`); icon-only controls get `aria-label`. Use an inline SVG in `public/assets` only for brand artwork Lucide lacks.

### 4.8.1 shadcn/ui

- Config in `components.json` (aliases: `components` `@/components`, `ui` `@/components/ui`, `utils` `@/utils/Cn`, `lib` `@/libs`, `hooks` `@/hooks`; Tailwind v4, no `tailwind.config`).
- Add components only with the CLI at the pinned version: `npx shadcn@4.23.0 add <name>` (never hand-copy from the docs or other repos). After adding, run `lint` (generated code may need small fixes) and bump the pin here when upgrading the CLI.
- Before building any primitive (button, input, dialog, menu, card, badge, toast, skeleton, separator), check `src/components/ui` and the shadcn catalog. Compose in `src/components/`; do not fork a primitive into a second copy.
- Customize through CVA variants and theme tokens, not ad-hoc classes at call sites. New visual variants go into the primitive's `cva` definition.
- Merge classes with `cn()` from `@/utils/Cn`; never concatenate class strings.
- Theme through the shadcn CSS variables in `global.css`, mapped from Figma tokens. Do not hard-code colors in components.
- Accessibility comes from Radix (focus trap, keyboard, ARIA). Do not remove `data-slot`, ARIA props, `asChild` or focus styles; give `Dialog` a `DialogTitle`, and icon-only buttons an `aria-label`.
- Toasts: `toast()` from `sonner`, mount `<Toaster />` once in the root layout. Toast text is translated.
- Primitives hold no copy: pass translated strings from callers.

### 4.8.2 Design token reference

Source: Figma GroceryApp, Colors and Typography frames. Font: Poppins via `next/font/google` (400, 500, 600, 700), exposed as `--font-poppins` on `<html>` and used by `--font-sans` (Storybook falls back to the system sans stack).

| Token (utility) | Value | Figma name |
|---|---|---|
| `--color-brand` (`bg-brand`) | #AEDC81 | primary |
| `--color-brand-dark` | #6CC51D | primary-dark |
| `--color-brand-light` | #EBFFD7 | primary-light |
| `--color-surface` | #F4F5F9 | background (2) |
| `--color-surface-muted` | #F5F5F5 | background (3) |
| `--color-text-strong` | #000000 | Text (black) |
| `--color-text-secondary` | #868889 | Text (grey) |
| `--color-text-tertiary` | #6F6F6F | variable tertiary |
| `--color-link` | #407EC7 | link |
| `--color-divider` | #DADCE0 | variable divider |
| `--color-pointer-inactive` | #DCDCDC | pointers (inactive bullet) |
| `--foreground` | #202124 | variable primary (heading text) |
| `--background`, `--card`, `--popover` | #FFFFFF | background |
| `--primary` | #6CC51D | primary-dark |
| `--secondary` | #EBFFD7 | primary-light |
| `--muted` / `--muted-foreground` | #F5F5F5 / #6F6F6F | background (3) / tertiary |
| `--accent` | #F4F5F9 | background (2) |
| `--border` / `--input` / `--ring` | #EBEBEB / #DADCE0 / #AEDC81 | Border / divider / primary |
| `--radius` | 0.25rem | swatch corners |

Typography utilities (`text-<style>`, include line height and weight): `title-sm` 15/20 600, `title-md` 20/25 600, `title-lg` 25/30 600, `title-xl` 30/36 600, `paragraph` 15/21 400, `paragraph-medium` 12/21 500, `label` 12/15 500, `heading-1` 30/1.3 700 (letter-spacing 3%), `paragraph-1` 15/normal 500 (letter-spacing 3%).

Usage rules:
- Components (shadcn primitives): semantic utilities (`bg-primary`, `text-muted-foreground`, `border-input`).
- Custom UI: brand, surface and text tokens (`bg-brand-light`, `text-text-secondary`, `text-link`).
- Text: `text-<style>` utilities, no ad-hoc font size or weight.
- Never raw hex or arbitrary color values.

Open design questions:
- Link color: fill #407EC7 vs caption 1A0DAB.
- `--primary-foreground`: white on #6CC51D is ~2.5:1, so dark text is used; needs sign-off.
- Radius: 4px only on documentation swatches; used as base radius.
- Title line heights (size + 5), Label line height 15 and Paragraph Medium sizes (10/12/15) are derived from captions.
- Placeholders, not in Figma: `--destructive*`, `--chart-*`, `--sidebar-*`.

### 4.9 Env, security, logging, monitoring

- Env: declare new variables in `src/libs/Env.ts` (schema + `runtimeEnv`), and add placeholders to the local env file template if one exists. Server secrets in `server`, browser-safe in `client` with `NEXT_PUBLIC_` prefix. Use `Env.X`; the only `process.env` exception is the one already in `proxy.ts`/`Arcjet.ts` for bundle size.
- Validate every external input (form data, JSON bodies, query params, headers) with Zod on the server. Return 422 with `z.treeifyError` for handlers.
- Authorization in every action and handler that touches user data: `getUser()`, then scope queries by `user.id`. Never accept a `userId` from the client.
- Do not expose secrets, stack traces or DB errors to clients. Return short, translated, generic messages.
- Rate-limit sensitive endpoints (auth, writes) with Arcjet rules (`aj.withRule(...)` from `@/libs/Arcjet`); bot detection and shield already run in `proxy.ts` when `ARCJET_KEY` is set.
- Never `dangerouslySetInnerHTML` with unsanitized content; validate redirect targets.
- Logging: `import { logger } from '@/libs/Logger'` (category `app`), server-side only (it pulls server env sinks). `logger.info|warn|error` with a static message plus structured properties; never log passwords, tokens or full emails.
- Monitoring: Sentry is initialized in `instrumentation.ts` / `instrumentation-client.ts`; let unexpected errors propagate so Sentry captures them. Use `Sentry.captureException` only when handling an error you swallow deliberately. Do not add `try/catch` to log and rethrow.
- Analytics: PostHog env vars exist but no client is wired. Do not add tracking without a ticket.

### 4.10 Testing and Storybook

- Unit (`*.test.ts`, node project) for pure logic in `utils`, `validations`, helpers: co-locate (`Helpers.test.ts`). Validation schemas get a test for valid, invalid and boundary values.
- Component tests (`*.test.tsx`, browser project, `vitest-browser-react` + `page` locators): wrap in `NextIntlClientProvider` with `@/locales/en.json`. Query by role/label, not by class or test id.
- Integration (`tests/integration/*.integ.ts`) for API/action behavior against the DB; E2E (`tests/e2e/*.e2e.ts`) for user flows, including a locale variant when copy matters. Visual regression runs through Chromatic (`Visual.e2e.ts`).
- Write tests for new logic, validation, actions and each user-visible flow; skip tests that only restate markup. Naming rules in `AGENTS.md`.
- Storybook: every new reusable component in `src/components` gets `<Name>.stories.tsx` (CSF3, `satisfies Meta<typeof X>`, `@storybook/nextjs-vite` types, `NextIntlClientProvider` decorator, `nextjs.appDirectory: false` parameter). Cover default, empty/long-content and error/disabled states. The a11y addon must show no violations.
- Run `test` and `test:e2e` for changed areas; run `storybook:test` when stories change.

### 4.11 Performance and accessibility

- Keep client bundles small: Server Components first, `next/dynamic` for heavy client-only widgets, no large libraries in client components.
- Avoid request waterfalls: `Promise.all` for independent queries; stream with Suspense around slow sections.
- Images optimized via `next/image` with `priority` only on the LCP image; reserve space to avoid layout shift.
- No premature memoization (React Compiler handles it). Do not add `useMemo`, `useCallback`, `React.memo`.
- Accessibility rules from 4.8 apply to every ticket; verify keyboard navigation and focus order manually.

### 4.12 Deployment (Vercel)

- `develop` is Vercel production; `main` is ignored; every PR branch gets a preview deployment.
- Vercel sets `DB_MODE=pglite`: each function instance runs an in-memory PGlite, migrated and seeded at start. Data resets on cold start and is not shared between instances: fine for click-through verification, not for persistence.
- Vercel runs the `vercel-build` script (`next build`); `build` runs `db:migrate` against `DATABASE_URL`, which does not exist there.
- `getBaseUrl()` falls back to the `NEXT_PUBLIC_VERCEL_*` variables when `NEXT_PUBLIC_APP_URL` is unset.
- Preview and production URLs are public (Vercel Authentication is off). For automation set `PLAYWRIGHT_BASE_URL=<preview url>`; Playwright then skips the local `webServer`. If protection is re-enabled, also set `VERCEL_AUTOMATION_BYPASS_SECRET` and Playwright sends the bypass headers.

## 5. Recipes

### 5.1 Add a public page
1. Create `src/app/[locale]/(marketing)/<route>/page.tsx`.
2. Default export `<Name>Page`, `params: Promise<{ locale: string }>`, await, `setRequestLocale(locale)`.
3. Add `generateMetadata` with `getTranslations({ locale, namespace: '<Name>Page' })` (`meta_title`, `meta_description`).
4. Add all copy to `en.json` and `nb.json` under `<Name>Page`; link with `Link` from `@/libs/I18nNavigation`.
5. Add to `src/app/sitemap.ts` if indexable. Add an e2e smoke test.

### 5.2 Add a protected dashboard page
1. Create `src/app/[locale]/(auth)/dashboard/<route>/page.tsx`. The proxy already guards `/dashboard/*`; no metadata in the page (layout owns it).
2. In the page, call `createSupabaseServerClient().auth.getUser()` when you need the user; scope all queries by `user.id`.
3. When a dashboard layout exists, add a nav entry in `dashboard/layout.tsx` with a translated label (create the layout with the dashboard metadata if it does not exist yet).
4. Sign-in/sign-up pages do not exist yet. When a ticket needs them, create them as public pages (for example `src/app/[locale]/(marketing)/sign-in/page.tsx`; `/sign-in` is the proxy's redirect target and must not be under `/dashboard`) with actions in `AuthActions.ts`.

### 5.3 Add a form with a server action
1. Schema: `src/validations/<Name>Validation.ts` (`z.object`, translated error keys).
2. Action: `src/actions/<Name>Actions.ts` with `'use server'`; `safeParse` input, `getUser()` check, DB write via Drizzle, `logger.info`, return `{ ok: true }` or `{ ok: false, fieldErrors }`; `redirect` from `@/libs/I18nNavigation` or `revalidatePath` on success.
3. Component: `'use client'`, `useForm` + `zodResolver`, shadcn `Field`/`FieldLabel`/`FieldError` + `Input` via `Controller`, shadcn `Button` for submit; call the action in `handleSubmit`, show field errors from `useTranslations`, disable submit while `isSubmitting`, `toast()` for success/failure feedback.
4. Add i18n keys (all locales), a validation unit test, and an e2e flow.

### 5.4 Add a DB table or column
1. Edit `src/models/Schema.ts`.
2. `db:generate`, review the SQL in `migrations/`, then `db:migrate`.
3. Add deterministic seed data to `src/models/Seed.ts`.
4. Add a Zod schema if it receives input; query only from server code via `@/libs/DB`.
5. Add an integration test (`tests/integration`).

### 5.5 Add translations
1. Add keys to `src/locales/en.json` under the right namespace, then the same keys to `nb.json`.
2. Use `getTranslations` (server) or `useTranslations` (client); `t.rich` for markup.
3. Run `check:i18n`.

### 5.6 Add a reusable UI component
1. Check `src/components/ui` first; if a primitive is missing, add it with `npx shadcn@4.23.0 add <name>`. Then `src/components/<Name>.tsx` composes primitives: named export, `props` param, `cn()` for classes, variants via CVA/tokens (not ad-hoc classes), semantic HTML, translated text. Only a new generic primitive goes in `ui/`.
2. `src/components/<Name>.stories.tsx` per 4.10.
3. `src/components/<Name>.test.tsx` per 4.10.
4. Use it in at least one page (Knip flags unused exports).

### 5.7 Implement a Figma screen
1. Parse the ticket's Figma URL (`fileKey`, `node-id` with `-` replaced by `:`). Follow the Figma MCP flow: `create_session`, `get_design_context`, `get_screenshot`, `get_variable_defs`.
2. Treat generated code as a reference only. First map each Figma component to a shadcn primitive in `src/components/ui` (add missing ones via the CLI) and set its variants/tokens to match Figma. Map the rest to this repo: theme variables and tokens in `global.css`, existing components (`src/components`, `src/templates`), `Link`/i18n helpers, no inline styles, no hard-coded text.
3. Create missing tokens before components. Download needed assets to `public/assets`; icons come from `lucide-react`.
4. Build from the outside in: route and layout, then components, then states (hover, focus, disabled, empty, error, loading) shown in Figma.
5. Compare against the Figma screenshot at the designed breakpoints; fix spacing, typography and colors until they match. Check responsive behavior where Figma has no mobile frame.
6. Run the definition of done.

## 6. Definition of done

- [ ] Matches Figma at all provided breakpoints; states and empty/error/loading handled.
- [ ] Uses existing components and tokens; Figma components mapped to shadcn primitives (added via CLI, `cn()`, variants, no hand-copied or duplicated primitives); no arbitrary values or demo content copied.
- [ ] No hard-coded strings; keys in all locales; `check:i18n` passes.
- [ ] Inputs validated with Zod on the server; every action/handler checks `getUser()`.
- [ ] Schema changes have generated and applied migrations (no push) and seed data in `src/models/Seed.ts`.
- [ ] No `any`, casts, `console.*`, unused exports, or new env reads outside `Env.ts`.
- [ ] Tests added/updated (unit, component, e2e as relevant); Storybook story for new reusable components.
- [ ] Accessibility: semantic markup, labels, focus styles, contrast, keyboard use.
- [ ] `lint`, `check:types`, `check:deps`, `check:i18n`, `test`, `build-local` pass; `storybook:test` when stories changed; `test:e2e` for affected flows.
- [ ] Conventional commit message; PR notes list assumptions and any new dependency with justification.

## 7. Sources

- Supabase, Bootstrap Next.js app with Supabase Auth (AI prompt): https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth
- Upstream boilerplate AGENTS.md: https://github.com/ixartz/Next-js-Boilerplate/blob/main/AGENTS.md
- Next.js docs (App Router, proxy, AI coding agents): https://nextjs.org/docs
- next-intl docs: https://next-intl.dev/docs
- Drizzle ORM docs: https://orm.drizzle.team/docs
- Zod 4 docs: https://zod.dev
- Tailwind CSS v4 theme variables: https://tailwindcss.com/docs/theme
- shadcn/ui docs (Next.js, Tailwind v4, theming): https://ui.shadcn.com/docs
- awesome-cursorrules (Next.js/React/TypeScript rules): https://github.com/PatrickJS/awesome-cursorrules
- Figma MCP design-to-code guidance: https://help.figma.com/hc/en-us/articles/32132100833559
