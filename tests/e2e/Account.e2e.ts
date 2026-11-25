import { expect, test } from '@playwright/test';
import { hasLiveSupabase, signInThroughForm, testEmail } from './helpers/auth';

const copyByLocale = {
  en: { prefix: '', heading: 'Welcome back !' },
  nb: { prefix: '/nb', heading: 'Velkommen tilbake!' },
};

for (const [locale, copy] of Object.entries(copyByLocale)) {
  test.describe(`Account page (${locale})`, () => {
    test('redirects an unauthenticated visitor to the sign-in screen', async ({ page }) => {
      await page.goto(`${copy.prefix}/account`);

      await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      await expect(
        page.getByRole('heading', { level: 1, name: copy.heading, exact: true }),
      ).toBeVisible();
    });
  });
}

test.describe('Account page (signed in)', () => {
  test.skip(!hasLiveSupabase, 'Requires a live Supabase project');

  test.beforeEach(async ({ page }) => {
    await signInThroughForm(page);
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Account', exact: true }),
    ).toBeVisible();
  });

  test.describe('menu', () => {
    test('shows Sign out as the last menu row without an arrow', async ({ page }) => {
      const lastRow = page.getByRole('list', { name: 'Account menu' }).getByRole('listitem').last();

      await expect(lastRow.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
      await expect(lastRow.locator('img[src*="chevron"]')).toHaveCount(0);
    });
  });

  test.describe('signing out', () => {
    test('signs the user out and lands on the home page after tapping Sign out', async ({
      page,
    }) => {
      await expect(page.getByText(`Signed in as ${testEmail}`)).toBeVisible();

      // Clicks before hydration are no-ops, so retry until the app reacts.
      await expect(async () => {
        await page.getByRole('button', { name: 'Sign out', exact: true }).click();
        await expect(page).toHaveURL(/\/$/u, { timeout: 3000 });
      }).toPass();
    });

    test('hides account details when reopening Account after signing out', async ({ page }) => {
      await expect(async () => {
        await page.getByRole('button', { name: 'Sign out', exact: true }).click();
        await expect(page).toHaveURL(/\/$/u, { timeout: 3000 });
      }).toPass();

      await page.goto('/account');

      await expect(page).toHaveURL(/\/sign-in$/u);
      await expect(page.getByText('Signed in as', { exact: false })).toBeHidden();
    });
  });
});
