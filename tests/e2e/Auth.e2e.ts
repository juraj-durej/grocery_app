import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const screens: {
  name: string;
  path: string;
  en: { heading: string; paragraph: string; title: RegExp };
  nb: { heading: string; paragraph: string; title: RegExp };
}[] = [
  {
    name: 'Sign-up page',
    path: '/sign-up',
    en: {
      heading: 'Create account',
      paragraph: 'Quickly create account',
      title: /Create account/u,
    },
    nb: {
      heading: 'Opprett konto',
      paragraph: 'Opprett en konto raskt',
      title: /Opprett konto/u,
    },
  },
  {
    name: 'Sign-in page',
    path: '/sign-in',
    en: { heading: 'Welcome back !', paragraph: 'Sign in to your account', title: /Login/u },
    nb: {
      heading: 'Velkommen tilbake!',
      paragraph: 'Logg inn på kontoen din',
      title: /Logg inn/u,
    },
  },
];

const signInCopy = {
  en: {
    prefix: '',
    welcome: 'Welcome',
    back: 'Back',
    emailLabel: 'Email address',
    emailPlaceholder: 'Email Address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    remember: 'Remember me',
    forgot: 'Forgot password',
    login: 'Login',
    prompt: 'Don’t have an account ?',
    signUp: 'Sign up',
    welcomeLoginLink: 'Login',
  },
  nb: {
    prefix: '/nb',
    welcome: 'Velkommen',
    back: 'Tilbake',
    emailLabel: 'E-postadresse',
    emailPlaceholder: 'E-postadresse',
    passwordLabel: 'Passord',
    passwordPlaceholder: 'Passord',
    show: 'Vis passord',
    hide: 'Skjul passord',
    remember: 'Husk meg',
    forgot: 'Glemt passord',
    login: 'Logg inn',
    prompt: 'Har du ikke en konto?',
    signUp: 'Registrer deg',
    welcomeLoginLink: 'Logg inn',
  },
};

const passwordInput = (page: Page, label: string) => page.getByLabel(label, { exact: true });

for (const screen of screens) {
  test.describe(screen.name, () => {
    test.describe('English locale', () => {
      test('shows the heading, subtitle and page title', async ({ page }) => {
        await page.goto(screen.path);

        await expect(
          page.getByRole('heading', { level: 1, name: screen.en.heading, exact: true }),
        ).toBeVisible();
        await expect(page.getByText(screen.en.paragraph)).toBeVisible();
        await expect(page.locator('header').getByText('Welcome', { exact: true })).toBeVisible();
        await expect(page).toHaveTitle(screen.en.title);
      });
    });

    test.describe('Norwegian locale', () => {
      test('shows the translated heading, subtitle and page title', async ({ page }) => {
        await page.goto(`/nb${screen.path}`);

        await expect(
          page.getByRole('heading', { level: 1, name: screen.nb.heading, exact: true }),
        ).toBeVisible();
        await expect(page.getByText(screen.nb.paragraph)).toBeVisible();
        await expect(page).toHaveTitle(screen.nb.title);
      });
    });
  });
}

test.describe('Sign-up page back arrow', () => {
  test('returns to the welcome screen from the back link', async ({ page }) => {
    await page.goto('/sign-up');

    await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute(
      'href',
      '/welcome',
    );
    await page.getByRole('link', { name: 'Back', exact: true }).click();

    await expect(page).toHaveURL(/\/welcome$/u);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome', exact: true }),
    ).toBeVisible();
  });

  test('returns to the Norwegian welcome screen from the back link', async ({ page }) => {
    await page.goto('/nb/sign-up');

    await expect(page.getByRole('link', { name: 'Tilbake', exact: true })).toHaveAttribute(
      'href',
      '/nb/welcome',
    );
    await page.getByRole('link', { name: 'Tilbake', exact: true }).click();

    await expect(page).toHaveURL(/\/nb\/welcome$/u);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Velkommen', exact: true }),
    ).toBeVisible();
  });
});

for (const locale of ['en', 'nb'] as const) {
  const copy = signInCopy[locale];

  test.describe(`Sign-in form (${locale})`, () => {
    test.describe('Elements and texts', () => {
      test('shows all form elements after tapping Login on the welcome screen', async ({
        page,
      }) => {
        await page.goto(`${copy.prefix}/welcome`);
        await page.getByRole('link', { name: copy.welcomeLoginLink, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('header').getByText(copy.welcome, { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: copy.back, exact: true })).toBeVisible();
        await expect(page.getByLabel(copy.emailLabel, { exact: true })).toBeVisible();
        await expect(page.getByPlaceholder(copy.emailPlaceholder, { exact: true })).toBeVisible();
        await expect(passwordInput(page, copy.passwordLabel)).toBeVisible();
        await expect(
          page.getByPlaceholder(copy.passwordPlaceholder, { exact: true }),
        ).toBeVisible();
        await expect(page.getByRole('button', { name: copy.show, exact: true })).toBeVisible();
        await expect(page.getByText(copy.remember, { exact: true })).toBeVisible();
        await expect(page.getByText(copy.forgot, { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: copy.login, exact: true })).toBeVisible();
        await expect(page.getByText(copy.prompt)).toBeVisible();
        await expect(page.getByRole('link', { name: copy.signUp, exact: true })).toBeVisible();
      });

      test('types the email and password as email and password inputs', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        await expect(page.getByLabel(copy.emailLabel, { exact: true })).toHaveAttribute(
          'type',
          'email',
        );
        await expect(passwordInput(page, copy.passwordLabel)).toHaveAttribute('type', 'password');
      });

      test('points the sign-up link to the sign-up screen', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        await expect(page.getByRole('link', { name: copy.signUp, exact: true })).toHaveAttribute(
          'href',
          `${copy.prefix}/sign-up`,
        );
      });

      test('opens the sign-up screen after tapping the sign-up link', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);

        await page.getByRole('link', { name: copy.signUp, exact: true }).click();

        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-up$`, 'u'));
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      });
    });

    test.describe('Password visibility toggle', () => {
      test('switches the password between hidden and plain text', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        const input = passwordInput(page, copy.passwordLabel);

        await input.fill('s3cret-Passw0rd');
        await expect(input).toHaveAttribute('type', 'password');

        await page.getByRole('button', { name: copy.show, exact: true }).click();
        await expect(input).toHaveAttribute('type', 'text');
        await expect(input).toHaveValue('s3cret-Passw0rd');
        await expect(page.getByRole('button', { name: copy.hide, exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: copy.show, exact: true })).toHaveCount(0);

        await page.getByRole('button', { name: copy.hide, exact: true }).click();
        await expect(input).toHaveAttribute('type', 'password');
        await expect(page.getByRole('button', { name: copy.show, exact: true })).toBeVisible();
      });

      test('toggles the visibility from the keyboard', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-in`);
        const input = passwordInput(page, copy.passwordLabel);

        await input.fill('s3cret-Passw0rd');
        await page.getByRole('button', { name: copy.show, exact: true }).focus();
        await page.keyboard.press('Enter');

        await expect(input).toHaveAttribute('type', 'text');
      });
    });

    test.describe('Back arrow', () => {
      test('returns to the welcome screen through history after opening Login from it', async ({
        page,
      }) => {
        await page.goto(`${copy.prefix}/welcome`);
        await page.getByRole('link', { name: copy.welcomeLoginLink, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));

        // Clicks before hydration are no-ops, so retry the click until the navigation happens.
        await expect(async () => {
          await page.getByRole('button', { name: copy.back, exact: true }).click();
          await expect(page).toHaveURL(new RegExp(`${copy.prefix}/welcome$`, 'u'), {
            timeout: 2000,
          });
        }).toPass();

        await expect(
          page.getByRole('heading', { level: 1, name: copy.welcome, exact: true }),
        ).toBeVisible();
      });

      test('falls back to the welcome screen when opened directly', async ({ page }) => {
        // A popup starts with an empty history, like a deep link opened in a new tab.
        await page.goto(`${copy.prefix}/welcome`);
        const popupPromise = page.waitForEvent('popup');
        await page.evaluate((path) => window.open(path), `${copy.prefix}/sign-in`);
        const popup = await popupPromise;
        await expect(popup).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));

        // Clicks before hydration are no-ops, so retry the click until the navigation happens.
        await expect(async () => {
          await popup.getByRole('button', { name: copy.back, exact: true }).click();
          await expect(popup).toHaveURL(new RegExp(`${copy.prefix}/welcome$`, 'u'), {
            timeout: 2000,
          });
        }).toPass();

        await expect(
          popup.getByRole('heading', { level: 1, name: copy.welcome, exact: true }),
        ).toBeVisible();
      });
    });
  });
}
