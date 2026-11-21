import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('takes a screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Welcome to BIG CART' }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('takes a screenshot of the shop home', async ({ page }, testInfo) => {
      await page.goto('/home');

      await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('takes a screenshot of the sign-up page', async ({ page }, testInfo) => {
      await page.goto('/sign-up');

      await expect(page.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible();

      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );

      await takeSnapshot(page, testInfo);
    });

    test('takes a screenshot of the sign-in page', async ({ page }, testInfo) => {
      await page.goto('/sign-in');

      await expect(page.getByRole('heading', { level: 1, name: 'Welcome back !' })).toBeVisible();

      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );

      await takeSnapshot(page, testInfo);
    });
  });
});
