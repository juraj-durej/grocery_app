import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('takes a screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
