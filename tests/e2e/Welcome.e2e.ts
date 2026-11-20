import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const paragraph = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy';

// Jumps straight to a slide without smooth scrolling so tests do not depend on animation timing.
const scrollToSlide = async (page: Page, position: number) => {
  await page.getByRole('main').evaluate((el, index) => {
    el.style.scrollBehavior = 'auto';
    el.scrollTo({ left: (index - 1) * el.clientWidth });
  }, position);
};

const expectRestingOn = async (page: Page, index: number) => {
  await expect
    .poll(
      async () =>
        await page
          .getByRole('main')
          .evaluate((el, n) => Math.abs(el.scrollLeft - n * el.clientWidth) <= 1, index),
    )
    .toBe(true);
};

const dot = (page: Page, position: number, name = `Go to slide ${position}`) =>
  page
    .getByRole('group', { name: /^(Choose slide|Velg lysbilde)$/u })
    .getByRole('button', { name });

test.describe('Welcome page', () => {
  test.describe('Reaching the page from the last slide', () => {
    test('shows all elements and texts after tapping Get started on slide 4', async ({ page }) => {
      await page.goto('/');
      await scrollToSlide(page, 4);
      await expectRestingOn(page, 3);

      await page.getByRole('button', { name: 'Get started' }).click();

      await expect(page).toHaveURL(/\/welcome$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
      await expect(page.locator('header').getByText('Welcome', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Back' })).toBeVisible();
      await expect(page.getByText(paragraph)).toBeVisible();
      await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible();
      await expect(page.getByText('Already have an account ?')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });

    test('omits a Google sign-in button', async ({ page }) => {
      await page.goto('/welcome');

      await expect(page.getByRole('button', { name: /google/iu })).toHaveCount(0);
      await expect(page.getByRole('link', { name: /google/iu })).toHaveCount(0);
    });
  });

  test.describe('Links', () => {
    test('points the actions to sign-up, sign-in and the last slide', async ({ page }) => {
      await page.goto('/welcome');

      await expect(page.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
        'href',
        '/sign-up',
      );
      await expect(page.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/sign-in');
      await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/?slide=4');
    });
  });

  test.describe('Navigation to the auth screens', () => {
    test('opens the create account screen after tapping Create an account', async ({ page }) => {
      await page.goto('/welcome');

      await page.getByRole('link', { name: 'Create an account' }).click();

      await expect(page).toHaveURL(/\/sign-up$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible();
    });

    test('opens the login screen after tapping Login', async ({ page }) => {
      await page.goto('/welcome');

      await page.getByRole('link', { name: 'Login' }).click();

      await expect(page).toHaveURL(/\/sign-in$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Welcome back !' })).toBeVisible();
    });

    test('opens the Norwegian create account screen', async ({ page }) => {
      await page.goto('/nb/welcome');

      await page.getByRole('link', { name: 'Opprett en konto' }).click();

      await expect(page).toHaveURL(/\/nb\/sign-up$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Opprett konto' })).toBeVisible();
    });

    test('opens the Norwegian login screen', async ({ page }) => {
      await page.goto('/nb/welcome');

      await page.getByRole('link', { name: 'Logg inn' }).click();

      await expect(page).toHaveURL(/\/nb\/sign-in$/u);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Velkommen tilbake!' }),
      ).toBeVisible();
    });
  });

  test.describe('Back arrow', () => {
    test('opens the last onboarding slide', async ({ page }) => {
      await page.goto('/welcome');

      await page.getByRole('link', { name: 'Back' }).click();

      await expect(page).toHaveURL(/\/\?slide=4$/u);
      await expectRestingOn(page, 3);
      await expect(dot(page, 4)).toHaveAttribute('aria-current', 'true');
      await expect(dot(page, 1)).not.toHaveAttribute('aria-current', 'true');
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Get Discounts On All Products',
        }),
      ).toBeInViewport();
    });
  });

  test.describe('Slide query parameter', () => {
    test('opens slide 2 for slide=2', async ({ page }) => {
      await page.goto('/?slide=2');

      await expectRestingOn(page, 1);
      await expect(dot(page, 2)).toHaveAttribute('aria-current', 'true');
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Buy Quality Dairy Products',
        }),
      ).toBeInViewport();
    });

    for (const { value, slide } of [
      { value: 'abc', slide: 1 },
      { value: '0', slide: 1 },
      { value: '-1', slide: 1 },
      { value: '9', slide: 4 },
    ]) {
      test(`opens slide ${slide} for slide=${value}`, async ({ page }) => {
        await page.goto(`/?slide=${value}`);

        await expectRestingOn(page, slide - 1);
        await expect(dot(page, slide)).toHaveAttribute('aria-current', 'true');
      });
    }

    test('shows the first heading in view for slide=abc', async ({ page }) => {
      await page.goto('/?slide=abc');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Welcome to BIG CART' }),
      ).toBeInViewport();
    });
  });

  test.describe('Layout', () => {
    for (const size of [
      { width: 414, height: 896 },
      { width: 375, height: 667 },
      { width: 1280, height: 800 },
    ]) {
      test(`avoids horizontal scroll and keeps actions visible at ${size.width}x${size.height}`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await page.goto('/welcome');

        await expect(page.getByRole('link', { name: 'Login' })).toBeInViewport({
          ratio: 1,
        });
        await expect(page.getByRole('link', { name: 'Create an account' })).toBeInViewport({
          ratio: 1,
        });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });
    }
  });

  test.describe('Norwegian locale', () => {
    test('shows the translated copy', async ({ page }) => {
      await page.goto('/nb/welcome');

      await expect(page.getByRole('heading', { level: 1, name: 'Velkommen' })).toBeVisible();
      await expect(page.locator('header').getByText('Velkommen', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Tilbake' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Opprett en konto' })).toBeVisible();
      await expect(page.getByText('Har du allerede en konto?')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logg inn' })).toBeVisible();
    });

    test('keeps the locale in the link targets', async ({ page }) => {
      await page.goto('/nb/welcome');

      await expect(page.getByRole('link', { name: 'Tilbake' })).toHaveAttribute(
        'href',
        '/nb?slide=4',
      );
      await expect(page.getByRole('link', { name: 'Opprett en konto' })).toHaveAttribute(
        'href',
        '/nb/sign-up',
      );
      await expect(page.getByRole('link', { name: 'Logg inn' })).toHaveAttribute(
        'href',
        '/nb/sign-in',
      );
    });

    test('opens the last Norwegian slide from the back arrow', async ({ page }) => {
      await page.goto('/nb/welcome');

      await page.getByRole('link', { name: 'Tilbake' }).click();

      await expectRestingOn(page, 3);
      await expect(dot(page, 4, 'Gå til lysbilde 4')).toHaveAttribute('aria-current', 'true');
    });
  });
});
