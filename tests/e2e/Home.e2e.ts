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

const activeColor = 'rgb(108, 197, 29)';
const inactiveColor = 'rgb(220, 220, 220)';

const dot = (page: Page, position: number, name = `Go to slide ${position}`) =>
  page
    .getByRole('group', { name: /^(Choose slide|Choisir la diapositive)$/u })
    .getByRole('button', { name });

// Asserts that exactly the given one-based dot is current and green while the other three are grey.
const expectActiveDot = async (page: Page, position: number) => {
  await Promise.all(
    [1, 2, 3, 4].map(async (n) => {
      const button = dot(page, n);
      if (n === position) {
        await expect(button).toHaveAttribute('aria-current', 'true');
        await expect(button).toHaveCSS('background-color', activeColor);
      } else {
        await expect(button).not.toHaveAttribute('aria-current', 'true');
        await expect(button).toHaveCSS('background-color', inactiveColor);
      }
    }),
  );
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

  test.describe('Page dots', () => {
    test('shows four dots with the first one active on load', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('group', { name: 'Choose slide' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Go to slide \d$/u })).toHaveCount(4);
      await expectActiveDot(page, 1);
    });

    test('sizes each dot 8px round and centres the row 148px above the bottom', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      await page.goto('/');

      const sizes = await page
        .getByRole('button', { name: /^Go to slide \d$/u })
        .evaluateAll((els) =>
          els.map((el) => {
            const style = getComputedStyle(el);
            return {
              width: style.width,
              height: style.height,
              // Tailwind rounded-full computes to a huge value; anything >= half the size is a circle.
              isCircle: Number(style.borderTopLeftRadius.replace('px', '')) >= 4,
            };
          }),
        );
      expect(sizes).toEqual(
        Array.from({ length: 4 }, () => ({ width: '8px', height: '8px', isCircle: true })),
      );
      const row = await page.getByRole('group', { name: 'Choose slide' }).boundingBox();
      expect(row?.width).toBe(48);
      expect(row?.height).toBe(8);
      expect(row?.x).toBeCloseTo(183, 0);
      expect(row?.y).toBeCloseTo(740, 0);
    });

    // Native scroll-snap swipes are exercised through scroll positions; touch gestures are not reliable in headless Chromium.
    test('activates each dot in order while scrolling slide 1 to 4', async ({ page }) => {
      await page.goto('/');

      await scrollToSlide(page, 2);
      await expectRestingOn(page, 1);
      await expectActiveDot(page, 2);

      await scrollToSlide(page, 3);
      await expectRestingOn(page, 2);
      await expectActiveDot(page, 3);

      await scrollToSlide(page, 4);
      await expectRestingOn(page, 3);
      await expectActiveDot(page, 4);
    });

    test('activates the matching dot when moving with the arrow keys', async ({ page }) => {
      await page.goto('/');

      await pressArrow(page, 'ArrowRight');
      await expectRestingOn(page, 1);
      await expectActiveDot(page, 2);

      await pressArrow(page, 'ArrowLeft');
      await expectRestingOn(page, 0);
      await expectActiveDot(page, 1);
    });

    test('jumps to slide 3 then back to slide 1 when tapping dots', async ({ page }) => {
      await page.goto('/');

      await dot(page, 3).click();
      await expectRestingOn(page, 2);
      await expectActiveDot(page, 3);
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Buy Premium Quality Fruits',
        }),
      ).toBeInViewport();

      await dot(page, 1).click();
      await expectRestingOn(page, 0);
      await expectActiveDot(page, 1);
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    });

    test('stays on slide 4 when pressing ArrowRight on the last slide', async ({ page }) => {
      await page.goto('/');
      await scrollToSlide(page, 4);
      await expectRestingOn(page, 3);

      await page.getByRole('main').focus();
      await page.keyboard.press('ArrowRight');

      await expectRestingOn(page, 3);
      await expectActiveDot(page, 4);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Get Discounts On All Products' }),
      ).toBeInViewport();
    });

    test('stays on slide 4 when scrolling further forward on the last slide', async ({ page }) => {
      await page.goto('/');
      await scrollToSlide(page, 4);
      await expectRestingOn(page, 3);

      await page.getByRole('main').evaluate((el) => {
        el.scrollBy({ left: el.clientWidth });
      });

      await expectRestingOn(page, 3);
      await expectActiveDot(page, 4);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Get Discounts On All Products' }),
      ).toBeInViewport();
    });

    test('keeps slide 1 shown without any automatic advance', async ({ page }) => {
      await page.goto('/');
      await expectActiveDot(page, 1);

      // Explicit wait: proves nothing moves on its own.
      await page.waitForTimeout(3000);

      await expectRestingOn(page, 0);
      await expectActiveDot(page, 1);
    });

    test('keeps the dots at the same viewport position after scrolling', async ({ page }) => {
      await page.goto('/');
      const row = page.getByRole('group', { name: 'Choose slide' });
      const before = await row.boundingBox();

      await scrollToSlide(page, 3);
      await expectRestingOn(page, 2);

      expect(await row.boundingBox()).toEqual(before);
    });
  });

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

    test('displays the translated page dot labels', async ({ page }) => {
      await page.goto('/fr');

      await expect(page.getByRole('group', { name: 'Choisir la diapositive' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Aller à la diapositive \d$/u })).toHaveText([
        '',
        '',
        '',
        '',
      ]);
      await expect(dot(page, 1, 'Aller à la diapositive 1')).toBeVisible();
      await expect(dot(page, 4, 'Aller à la diapositive 4')).toBeVisible();
    });
  });
});
