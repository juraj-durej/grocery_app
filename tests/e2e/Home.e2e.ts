import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const slides = [
  { position: 1, heading: 'Welcome to BIG CART', photo: 'slide-1-bag.jpg' },
  { position: 2, heading: 'Buy Quality Dairy Products', photo: 'slide-2-eggs.jpg' },
  { position: 3, heading: 'Buy Premium Quality Fruits', photo: 'slide-3-mesh-bag.jpg' },
  { position: 4, heading: 'Get Discounts On All Products', photo: 'slide-4-apple.jpg' },
] as const;

const photo = (page: Page, file: string) =>
  page.locator(`img[src*="${encodeURIComponent(`/assets/images/welcome/${file}`)}"]`);

const expectLoaded = async (image: Locator) => {
  await expect
    .poll(
      async () =>
        await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
    )
    .toBe(true);
};

// Jumps straight to a slide without smooth scrolling so tests do not depend on animation timing.
const scrollToSlide = async (page: Page, position: number) => {
  await page.getByRole('main').evaluate((el, index) => {
    el.style.scrollBehavior = 'auto';
    el.scrollTo({ left: (index - 1) * el.clientWidth });
  }, position);
};

// Waits until the carousel rests exactly on the given zero-based slide.
const expectRestingOn = async (page: Page, index: number) => {
  const carousel = page.getByRole('main');
  await expect
    .poll(
      async () =>
        await carousel.evaluate(
          (el, n) => Math.abs(el.scrollLeft - n * el.clientWidth) <= 1,
          index,
        ),
    )
    .toBe(true);
};

// Smooth scrolling swallows key presses sent mid-animation, so wait until the carousel rests on a slide.
const pressArrow = async (page: Page, key: 'ArrowLeft' | 'ArrowRight') => {
  const carousel = page.getByRole('main');
  await carousel.focus();
  await expectRestingOn(page, key === 'ArrowRight' ? 0 : 1);
  await page.keyboard.press(key);
};

test.describe('Home page', () => {
  test.describe('Welcome slide 1', () => {
    test('shows the welcome heading, logo, paragraph and bag photo', async ({ page }) => {
      await page.goto('/');

      const heading = page.getByRole('heading', { level: 1, name: 'Welcome to BIG CART' });
      await expect(heading).toBeInViewport();
      await expect(heading.getByRole('img', { name: 'BIG CART' })).toBeInViewport();
      await expect(
        page
          .getByRole('group', { name: '1 of 4' })
          .getByText('Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy'),
      ).toBeInViewport();
      const bag = photo(page, 'slide-1-bag.jpg');
      await expect(bag).toBeInViewport();
      await expectLoaded(bag);
    });

    test('keeps later slides out of the viewport on first load', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { level: 2 }).first()).not.toBeInViewport();
    });
  });

  test.describe('Carousel', () => {
    test('exposes four labelled slides in order', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('main')).toHaveAttribute('aria-roledescription', 'carousel');
      await expect(page.locator('[role="group"][aria-roledescription="slide"]')).toHaveCount(4);
      await expect(page.getByRole('group', { name: /^\d of 4$/u })).toHaveText([
        /Welcome to/u,
        /Buy Quality\s*Dairy Products/u,
        /Buy Premium\s*Quality Fruits/u,
        /Get Discounts\s*On All Products/u,
      ]);
    });

    test('moves to slide 2 with ArrowRight and back to slide 1 with ArrowLeft', async ({
      page,
    }) => {
      await page.goto('/');

      await pressArrow(page, 'ArrowRight');
      await expectRestingOn(page, 1);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Buy Quality Dairy Products' }),
      ).toBeInViewport();

      await pressArrow(page, 'ArrowLeft');
      await expectRestingOn(page, 0);
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    });

    test('avoids horizontal page scroll at 375px', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      const widths = await page
        .locator('[aria-roledescription="slide"]')
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
      expect(widths).toEqual([375, 375, 375, 375]);
    });
  });

  for (const slide of slides.slice(1)) {
    test.describe(`Welcome slide ${slide.position}`, () => {
      test('shows the heading and photo after scrolling', async ({ page }) => {
        await page.goto('/');

        await scrollToSlide(page, slide.position);

        await expect(page.getByRole('heading', { level: 2, name: slide.heading })).toBeInViewport();
        const image = photo(page, slide.photo);
        await expect(image).toBeInViewport();
        await expectLoaded(image);
      });
    });
  }

  test.describe('French locale', () => {
    test('displays the translated slide 1 heading', async ({ page }) => {
      await page.goto('/fr');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Bienvenue chez BIG CART' }),
      ).toBeInViewport();
    });

    test('displays the translated slide 2 heading after scrolling', async ({ page }) => {
      await page.goto('/fr');

      await scrollToSlide(page, 2);

      await expect(
        page.getByRole('heading', { level: 2, name: /produits laitiers de qualité/u }),
      ).toBeInViewport();
    });
  });
});
