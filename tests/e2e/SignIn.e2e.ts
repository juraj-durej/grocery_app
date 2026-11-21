import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const copyByLocale = {
  en: {
    prefix: '',
    email: 'Email address',
    password: 'Password',
    login: 'Login',
    remember: 'Remember me',
    forgot: 'Forgot password',
    forgotHeading: 'Forgot Password',
    forgotBack: 'Back to login',
    emailRequired: 'Enter your email address',
    emailInvalid: 'Enter a valid email address',
    passwordRequired: 'Enter your password',
    wrongCredentials: 'Incorrect email or password',
    homeHeading: 'Home',
  },
  nb: {
    prefix: '/nb',
    email: 'E-postadresse',
    password: 'Passord',
    login: 'Logg inn',
    remember: 'Husk meg',
    forgot: 'Glemt passord',
    forgotHeading: 'Glemt passord',
    forgotBack: 'Tilbake til innlogging',
    emailRequired: 'Skriv inn e-postadressen din',
    emailInvalid: 'Skriv inn en gyldig e-postadresse',
    passwordRequired: 'Skriv inn passordet ditt',
    wrongCredentials: 'Feil e-post eller passord',
    homeHeading: 'Hjem',
  },
};

type Copy = (typeof copyByLocale)['en'];

const testEmail = process.env.E2E_USER_EMAIL ?? 'anna.novak@example.com';
const testPassword = process.env.E2E_USER_PASSWORD ?? 'Groceries123';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const hasLiveSupabase =
  Boolean(supabaseKey) &&
  supabaseKey !== 'dummy_supabase_publishable_key' &&
  supabaseKey !== 'your_supabase_publishable_key' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54321';
const hasCustomAccount = Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);

// Clicks before hydration are no-ops, so retry the submit until the form reacts.
const submitLogin = async (page: Page, copy: Copy, expectation: () => Promise<void>) => {
  await expect(async () => {
    await page.getByRole('button', { name: copy.login, exact: true }).click();
    await expectation();
  }).toPass();
};

const fillCredentials = async (page: Page, copy: Copy, email: string, password: string) => {
  await page.getByLabel(copy.email, { exact: true }).fill(email);
  await page.getByLabel(copy.password, { exact: true }).fill(password);
};

const switchOn = async (page: Page, copy: Copy) => {
  const toggle = page.getByRole('switch', { name: copy.remember, exact: true });

  await expect(async () => {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true', {
      timeout: 1000,
    });
  }).toPass();
};

const authCookies = async (page: Page) => {
  const cookies = await page.context().cookies();

  return cookies.filter((cookie) => cookie.name.startsWith('sb-'));
};

for (const locale of ['en', 'nb'] as const) {
  const copy = copyByLocale[locale];

  test.describe(`Sign-in login (${locale})`, () => {
    test.describe('Remember me switch', () => {
      test('shows the switch off by default', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        const toggle = page.getByRole('switch', {
          name: copy.remember,
          exact: true,
        });

        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      test('toggles on and off after clicking the switch', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        const toggle = page.getByRole('switch', {
          name: copy.remember,
          exact: true,
        });

        await switchOn(page, copy);
        await toggle.click();

        await expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      test('toggles on and off after clicking the label', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        const toggle = page.getByRole('switch', {
          name: copy.remember,
          exact: true,
        });

        await expect(async () => {
          await page.getByText(copy.remember, { exact: true }).click();
          await expect(toggle).toHaveAttribute('aria-checked', 'true', {
            timeout: 1000,
          });
        }).toPass();

        await page.getByText(copy.remember, { exact: true }).click();

        await expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      test('toggles on from the keyboard', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        const toggle = page.getByRole('switch', {
          name: copy.remember,
          exact: true,
        });

        await expect(async () => {
          await toggle.focus();
          await page.keyboard.press('Space');
          await expect(toggle).toHaveAttribute('aria-checked', 'true', {
            timeout: 1000,
          });
        }).toPass();
      });
    });

    test.describe('Forgot password link', () => {
      test('opens the forgot password screen and returns to login', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        await page.getByRole('link', { name: copy.forgot, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/forgot-password$`, 'u'));
        await expect(
          page.getByRole('heading', {
            level: 1,
            name: copy.forgotHeading,
            exact: true,
          }),
        ).toBeVisible();

        await page.getByRole('link', { name: copy.forgotBack, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      });
    });

    test.describe('Validation and errors', () => {
      test('shows email and password errors after submitting empty', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        await submitLogin(page, copy, async () => {
          await expect(page.getByText(copy.emailRequired, { exact: true })).toBeVisible({
            timeout: 1000,
          });
        });

        await expect(page.getByText(copy.passwordRequired, { exact: true })).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      });

      test('shows the invalid email error for a malformed address', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        await fillCredentials(page, copy, 'not-an-email', 'whatever1');

        await submitLogin(page, copy, async () => {
          await expect(page.getByText(copy.emailInvalid, { exact: true })).toBeVisible({
            timeout: 1000,
          });
        });

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      });

      test('shows the incorrect credentials error for a wrong password', async ({ page }) => {
        test.skip(
          !hasLiveSupabase,
          'Needs a live Supabase project (set NEXT_PUBLIC_SUPABASE_* secrets)',
        );
        await page.goto(`${copy.prefix}/sign-in`);
        await fillCredentials(page, copy, 'anna.novak@example.com', 'wrong123');

        await submitLogin(page, copy, async () => {
          await expect(page.getByText(copy.wrongCredentials, { exact: true })).toBeVisible({
            timeout: 5000,
          });
        });

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      });
    });
  });
}

test.describe('Sign-in successful login', () => {
  test.skip(!hasLiveSupabase, 'Needs a live Supabase project (set NEXT_PUBLIC_SUPABASE_* secrets)');

  const copy = copyByLocale.en;
  const wrongCredentials = (page: Page) => page.getByText(copy.wrongCredentials, { exact: true });

  const login = async (page: Page, options: { remember: boolean }) => {
    await page.goto('/sign-in');
    await fillCredentials(page, copy, testEmail, testPassword);

    if (options.remember) {
      await switchOn(page, copy);
    }

    await page.getByRole('button', { name: copy.login, exact: true }).click();
    await expect(
      wrongCredentials(page).or(
        page.getByRole('heading', {
          level: 1,
          name: copy.homeHeading,
          exact: true,
        }),
      ),
    ).toBeVisible();

    test.skip(
      !hasCustomAccount && (await wrongCredentials(page).isVisible()),
      'Account anna.novak@example.com does not exist; set E2E_USER_EMAIL and E2E_USER_PASSWORD',
    );

    await expect(page).toHaveURL(/\/dashboard$/u);
  };

  test('opens Home and stores the user after logging in with remember me off', async ({ page }) => {
    await login(page, { remember: false });

    const stored = await page.evaluate(() => localStorage.getItem('grocery-app-store'));

    expect(stored).toContain(testEmail);

    const cookies = await authCookies(page);

    expect(cookies.length).toBeGreaterThan(0);
    for (const cookie of cookies) {
      expect(cookie.expires).toBe(-1);
    }
  });

  test('keeps persistent auth cookies after logging in with remember me on', async ({ page }) => {
    await login(page, { remember: true });

    const cookies = await authCookies(page);

    expect(cookies.length).toBeGreaterThan(0);
    for (const cookie of cookies) {
      expect(cookie.expires).toBeGreaterThan(0);
    }
  });
});
