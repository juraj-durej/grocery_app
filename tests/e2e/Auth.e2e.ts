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

      test('returns to the welcome screen from the back arrow', async ({ page }) => {
        await page.goto(screen.path);

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

      test('returns to the Norwegian welcome screen from the back arrow', async ({ page }) => {
        await page.goto(`/nb${screen.path}`);

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
  });
}
