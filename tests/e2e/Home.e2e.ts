import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test.describe('Default locale', () => {
    test('displays only the Hello World heading', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { level: 1, name: 'Hello World' })).toBeVisible();
      await expect(page.locator('body')).toHaveText('Hello World');
      await expect(page.getByRole('link')).toHaveCount(0);
    });

    test('renders a white background', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        /rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\)/u,
      );
    });
  });

  test.describe('French locale', () => {
    test('displays the translated heading', async ({ page }) => {
      await page.goto('/fr');

      await expect(page.getByRole('heading', { level: 1, name: 'Bonjour le monde' })).toBeVisible();
    });
  });
});
