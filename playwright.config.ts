import type { ChromaticConfig } from '@chromatic-com/playwright';
import { defineConfig, devices } from '@playwright/test';

// Use process.env.PORT by default and fallback to port 3008
// to avoid conflicts with the Next.js default port 3000.
const PORT = process.env.PORT ?? '3008';

// PGlite port, set per git worktree in .env.local so parallel tasks don't clash (default 5432).
const DB_PORT = process.env.DB_PORT ?? '5432';

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const localBaseURL = `http://localhost:${PORT}`;

// Run against a deployed (e.g. Vercel preview) URL instead of a local server
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = remoteBaseURL ?? localBaseURL;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ChromaticConfig>({
  testDir: './tests',
  // Look for files with the .integ.js or .e2e.js extension
  testMatch: '*.@(integ|e2e).?(c|m)[jt]s?(x)',
  // Timeout per test, test running locally are slower due to database connections with PGLite
  timeout: 30 * 1000,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI ? 'github' : 'list',

  expect: {
    // Set timeout for async expect matchers
    timeout: 15 * 1000,
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: remoteBaseURL
    ? undefined
    : {
        command: process.env.CI
          ? `pglite-server -m 100 --port=${DB_PORT} --run 'run-s db:migrate start'`
          : `pglite-server -m 100 --port=${DB_PORT} --run 'run-s db:migrate dev:next'`,
        url: localBaseURL,
        timeout: 60 * 1000,
        reuseExistingServer: !process.env.CI,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 2 * 1000 },
        env: {
          BROWSER_TO_TERMINAL_DISABLED: 'true',
          NEXT_PUBLIC_SENTRY_DISABLED: 'true',
          NEXT_PUBLIC_APP_URL: localBaseURL,
          PORT,
        },
      },

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Bypass Vercel Deployment Protection on preview URLs
    ...(remoteBaseURL && bypassSecret
      ? {
          extraHTTPHeaders: {
            'x-vercel-protection-bypass': bypassSecret,
            'x-vercel-set-bypass-cookie': 'true',
          },
        }
      : {}),

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: process.env.CI ? 'on' : 'retain-on-failure',

    // Record videos when retrying the failed test.
    video: process.env.CI ? 'retain-on-failure' : undefined,

    // Disable automatic screenshots at test completion when using Chromatic test fixture.
    disableAutoSnapshot: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
  ],
});
