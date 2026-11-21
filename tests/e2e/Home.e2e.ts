import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const featured = [
  { name: 'Fresh Peach', price: '$8.00', unit: 'dozen', badge: null },
  { name: 'Avacoda', price: '$7.00', unit: '2.0 lbs', badge: 'NEW' },
  { name: 'Pineapple', price: '$9.90', unit: '1.50 lbs', badge: null },
  { name: 'Black Grapes', price: '$7.05', unit: '5.0 lbs', badge: '-16%' },
  { name: 'Pomegranate', price: '$2.09', unit: '1.50 lbs', badge: 'NEW' },
  { name: 'Fresh B roccoli', price: '$3.00', unit: '1 kg', badge: null },
];

// Waits for the server action triggered by the click, so the next action reuses the session cookie.
const clickAndSettle = async (page: Page, button: Locator) => {
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && 'next-action' in response.request().headers(),
    ),
    button.click(),
  ]);
};

const card = (page: Page, name: string) =>
  page.getByRole('article').filter({ hasText: name }).first();

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Layout', () => {
    test('renders sections in design order', async ({ page }) => {
      const search = page.getByRole('link', { name: 'Search keywords..' });
      const banner = page.getByText('20% off on your first purchase').first();
      const categories = page.getByRole('heading', { name: 'Categories' });
      const featuredTitle = page.getByRole('heading', { name: 'Featured products' });

      await expect(search).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(categories).toBeVisible();
      await expect(featuredTitle).toBeVisible();

      const tops = await Promise.all(
        [search, banner, categories, featuredTitle].map(async (locator) => {
          const box = await locator.boundingBox();
          return box?.y ?? Number.NaN;
        }),
      );

      expect(tops).toEqual(tops.toSorted((a, b) => a - b));
    });

    test('lists six featured products in design order', async ({ page }) => {
      const cards = page.getByRole('article');

      await expect(cards).toHaveCount(featured.length);

      await Promise.all(
        featured.map(async (product, index) => {
          const current = cards.nth(index);

          await expect(current).toContainText(product.name);
          await expect(current).toContainText(product.price);
          await expect(current).toContainText(product.unit);

          if (product.badge) {
            await expect(current).toContainText(product.badge);
          }
        }),
      );
    });
  });

  test.describe('Search', () => {
    test('opens search from the search bar', async ({ page }) => {
      await page.getByRole('link', { name: 'Search keywords..' }).click();

      await expect(page).toHaveURL(/\/search$/u);
    });

    test('opens filters from the filter icon', async ({ page }) => {
      await page.getByRole('link', { name: 'Filters' }).click();

      await expect(page).toHaveURL(/\/filter$/u);
    });
  });

  test.describe('Categories', () => {
    test('opens the categories page from the section title', async ({ page }) => {
      await page.getByRole('heading', { name: 'Categories' }).getByRole('link').click();

      await expect(page).toHaveURL(/\/categories$/u);
    });

    test('opens the fruits list from the Fruits category', async ({ page }) => {
      await page.getByRole('link', { name: 'Fruits' }).click();

      await expect(page).toHaveURL(/\/categories\/fruits$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Fruits' })).toBeVisible();
      await expect(card(page, 'Fresh Peach')).toBeVisible();
    });

    test('opens the household list from the last category after scrolling', async ({ page }) => {
      const household = page.getByRole('link', { name: 'Household' });

      await household.scrollIntoViewIfNeeded();
      await household.click();

      await expect(page).toHaveURL(/\/categories\/household$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Household' })).toBeVisible();
    });
  });

  test.describe('Cart', () => {
    test('adds a product and increases its quantity to three', async ({ page }) => {
      const peach = card(page, 'Fresh Peach');

      await clickAndSettle(page, peach.getByRole('button', { name: 'Add to cart' }));
      await expect(peach.getByTestId('cart-quantity')).toHaveText('1');

      await clickAndSettle(page, peach.getByRole('button', { name: 'Increase quantity' }));
      await expect(peach.getByTestId('cart-quantity')).toHaveText('2');
      await clickAndSettle(page, peach.getByRole('button', { name: 'Increase quantity' }));
      await expect(peach.getByTestId('cart-quantity')).toHaveText('3');

      await page.getByRole('link', { name: 'Cart' }).click();

      await expect(page).toHaveURL(/\/cart$/u);

      const line = page.getByTestId('cart-line').filter({ hasText: 'Fresh Peach' });

      await expect(line).toHaveCount(1);
      await expect(line.getByTestId('cart-quantity')).toHaveText('3');
    });

    test('removes a product when decreasing from quantity one', async ({ page }) => {
      const peach = card(page, 'Fresh Peach');

      await clickAndSettle(page, peach.getByRole('button', { name: 'Add to cart' }));
      await expect(peach.getByTestId('cart-quantity')).toHaveText('1');

      await clickAndSettle(page, peach.getByRole('button', { name: 'Decrease quantity' }));

      await expect(peach.getByRole('button', { name: 'Add to cart' })).toBeVisible();

      await page.getByRole('link', { name: 'Cart' }).click();

      await expect(page.getByText('Your cart is empty.')).toBeVisible();
    });
  });

  test.describe('Favorites', () => {
    test('toggles a favorite and reflects it on the favorites page', async ({ page }) => {
      const grapes = card(page, 'Black Grapes');

      await clickAndSettle(page, grapes.getByRole('button', { name: 'Add to favorites' }));
      await expect(grapes.getByRole('button', { name: 'Remove from favorites' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await page.getByRole('link', { name: 'Favorites' }).click();

      await expect(page).toHaveURL(/\/favorites$/u);
      await expect(card(page, 'Black Grapes')).toBeVisible();

      await page.getByRole('link', { name: 'Home' }).click();

      await expect(page).toHaveURL(/\/$/u);

      const homeGrapes = card(page, 'Black Grapes');
      const remove = homeGrapes.getByRole('button', { name: 'Remove from favorites' });

      await expect(remove).toHaveAttribute('aria-pressed', 'true');

      await clickAndSettle(page, remove);

      await expect(homeGrapes.getByRole('button', { name: 'Add to favorites' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );

      await page.getByRole('link', { name: 'Favorites' }).click();

      await expect(page.getByText('You have no favorite products yet.')).toBeVisible();
    });
  });

  test.describe('Product detail', () => {
    test('opens product detail from the card', async ({ page }) => {
      await card(page, 'Pineapple').getByRole('link').click();

      await expect(page).toHaveURL(/\/products\/pineapple$/u);
      await expect(page.getByRole('heading', { level: 1, name: 'Pineapple' })).toBeVisible();
    });
  });

  test.describe('Bottom navigation', () => {
    test('opens the account page', async ({ page }) => {
      await page.getByRole('link', { name: 'Account' }).click();

      await expect(page).toHaveURL(/\/account$/u);
    });
  });
});
