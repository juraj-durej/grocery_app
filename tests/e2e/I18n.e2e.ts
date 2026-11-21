import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from English to French using dropdown and verify text on the about page', async ({
      page,
    }) => {
      await page.goto('/about');

      await expect(page.getByText('Welcome to our About page', { exact: false })).toBeVisible();

      await page.getByLabel('Change language').selectOption('fr');

      await expect(page.getByText('Bienvenue sur notre page', { exact: false })).toBeVisible();
    });
  });
});
