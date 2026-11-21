import { expect, test } from '@playwright/test';

const copyByLocale = {
  en: { prefix: '', heading: 'Welcome back !' },
  nb: { prefix: '/nb', heading: 'Velkommen tilbake!' },
};

for (const [locale, copy] of Object.entries(copyByLocale)) {
  test.describe(`Dashboard page (${locale})`, () => {
    test('redirects an unauthenticated visitor to the sign-in screen', async ({ page }) => {
      await page.goto(`${copy.prefix}/dashboard`);

      await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-in$`, 'u'));
      await expect(
        page.getByRole('heading', { level: 1, name: copy.heading, exact: true }),
      ).toBeVisible();
    });
  });
}
