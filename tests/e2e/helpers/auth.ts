import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

export const testEmail = process.env.E2E_USER_EMAIL ?? 'anna.novak@example.com';
export const testPassword = process.env.E2E_USER_PASSWORD ?? 'Groceries123';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasLiveSupabase =
  Boolean(supabaseKey) &&
  supabaseKey !== 'dummy_supabase_publishable_key' &&
  supabaseKey !== 'your_supabase_publishable_key' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54321';

export const hasCustomAccount = Boolean(
  process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD,
);

/**
 * Signs in through the real sign-in form and lands on the shop home.
 * Skips the running test when the default account does not exist.
 * @param page - The page to sign in with.
 */
export const signInThroughForm = async (page: Page) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email address', { exact: true }).fill(testEmail);
  await page.getByLabel('Password', { exact: true }).fill(testPassword);

  const wrongCredentials = page.getByText('Incorrect email or password', { exact: true });

  // Clicks before hydration are no-ops, so retry the submit until the form reacts.
  await expect(async () => {
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(
      wrongCredentials.or(page.getByRole('heading', { level: 1, name: 'Home', exact: true })),
    ).toBeVisible({ timeout: 3000 });
  }).toPass();

  test.skip(
    !hasCustomAccount && (await wrongCredentials.isVisible()),
    'Account anna.novak@example.com does not exist; set E2E_USER_EMAIL and E2E_USER_PASSWORD',
  );

  await expect(page).toHaveURL(/\/dashboard$/u);
};
