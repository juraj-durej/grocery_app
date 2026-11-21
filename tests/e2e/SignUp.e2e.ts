import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const copyByLocale = {
  en: {
    prefix: '',
    email: 'Email address',
    phone: 'Phone number',
    password: 'Password',
    signup: 'Signup',
    login: 'Login',
    signInHref: '/sign-in',
    signInHeading: 'Welcome back !',
    prompt: /Already have an account \?/u,
    show: 'Show password',
    hide: 'Hide password',
    emailInvalid: 'Enter a valid email address',
    phoneInvalid: 'Enter a valid phone number',
    passwordShort: 'Password must be at least 8 characters',
  },
  nb: {
    prefix: '/nb',
    email: 'E-postadresse',
    phone: 'Telefonnummer',
    password: 'Passord',
    signup: 'Registrer deg',
    login: 'Logg inn',
    signInHref: '/nb/sign-in',
    signInHeading: 'Velkommen tilbake!',
    prompt: /Har du allerede en konto\?/u,
    show: 'Vis passord',
    hide: 'Skjul passord',
    emailInvalid: 'Skriv inn en gyldig e-postadresse',
    phoneInvalid: 'Skriv inn et gyldig telefonnummer',
    passwordShort: 'Passordet må ha minst 8 tegn',
  },
};

for (const [locale, copy] of Object.entries(copyByLocale)) {
  test.describe(`Sign-up form (${locale})`, () => {
    test('shows the labelled fields with the expected input types', async ({ page }) => {
      await page.goto(`${copy.prefix}/sign-up`);

      const email = page.getByLabel(copy.email, { exact: true });
      const phone = page.getByLabel(copy.phone, { exact: true });
      const password = page.getByLabel(copy.password, { exact: true });

      await expect(email).toBeVisible();
      await expect(email).toHaveAttribute('type', 'email');
      await expect(email).toHaveAttribute('placeholder', copy.email);
      await expect(phone).toBeVisible();
      await expect(phone).toHaveAttribute('type', 'tel');
      await expect(phone).toHaveAttribute('placeholder', copy.phone);
      await expect(password).toBeVisible();
      await expect(password).toHaveAttribute('type', 'password');
      await expect(password).toHaveAttribute('placeholder', copy.password);
    });

    test('accepts typed text in each field', async ({ page }) => {
      await page.goto(`${copy.prefix}/sign-up`);

      const emailValue = faker.internet.email();
      const phoneValue = '+4791234567';
      const passwordValue = faker.internet.password({ length: 12 });

      const email = page.getByLabel(copy.email, { exact: true });
      const phone = page.getByLabel(copy.phone, { exact: true });
      const password = page.getByLabel(copy.password, { exact: true });

      await email.click();
      await email.fill(emailValue);
      await phone.click();
      await phone.fill(phoneValue);
      await password.click();
      await password.fill(passwordValue);

      await expect(email).toHaveValue(emailValue);
      await expect(phone).toHaveValue(phoneValue);
      await expect(password).toHaveValue(passwordValue);
      await expect(password).toHaveAttribute('type', 'password');
    });

    test('fits the page within the mobile viewport without horizontal scrolling', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      await page.goto(`${copy.prefix}/sign-up`);
      await expect(page.getByLabel(copy.email, { exact: true })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('shows the signup button', async ({ page }) => {
      await page.goto(`${copy.prefix}/sign-up`);

      await expect(page.getByRole('button', { name: copy.signup, exact: true })).toBeVisible();
    });

    test('shows the login prompt linking to the sign-in page', async ({ page }) => {
      await page.goto(`${copy.prefix}/sign-up`);

      await expect(page.getByText(copy.prompt)).toBeVisible();
      await expect(page.getByRole('link', { name: copy.login, exact: true })).toHaveAttribute(
        'href',
        copy.signInHref,
      );
    });

    test('navigates to the sign-in page from the login link', async ({ page }) => {
      await page.goto(`${copy.prefix}/sign-up`);

      await page.getByRole('link', { name: copy.login, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${copy.signInHref}$`, 'u'));
      await expect(
        page.getByRole('heading', { level: 1, name: copy.signInHeading, exact: true }),
      ).toBeVisible();
    });

    test.describe('Password visibility toggle', () => {
      test('hides the password by default with a show toggle', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);

        await expect(page.getByLabel(copy.password, { exact: true })).toHaveAttribute(
          'type',
          'password',
        );
        await expect(page.getByRole('button', { name: copy.show, exact: true })).toBeVisible();
      });

      test('switches the password between plain text and hidden on each toggle', async ({
        page,
      }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        const password = page.getByLabel(copy.password, { exact: true });

        await password.fill('Groceries123');
        await page.getByRole('button', { name: copy.show, exact: true }).click();

        await expect(password).toHaveAttribute('type', 'text');
        await expect(password).toHaveValue('Groceries123');
        await expect(page.getByRole('button', { name: copy.hide, exact: true })).toBeVisible();

        await page.getByRole('button', { name: copy.hide, exact: true }).click();

        await expect(password).toHaveAttribute('type', 'password');
        await expect(password).toHaveValue('Groceries123');
        await expect(page.getByRole('button', { name: copy.show, exact: true })).toBeVisible();
      });

      test('toggles the password with the keyboard', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        const password = page.getByLabel(copy.password, { exact: true });

        await page.getByRole('button', { name: copy.show, exact: true }).focus();
        await page.keyboard.press('Enter');

        await expect(password).toHaveAttribute('type', 'text');
      });
    });

    test.describe('Validation', () => {
      test('shows field errors and stays on the page after an empty submit', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);

        await page.getByRole('button', { name: copy.signup, exact: true }).click();

        await expect(page.getByText(copy.emailInvalid)).toBeVisible();
        await expect(page.getByText(copy.phoneInvalid)).toBeVisible();
        await expect(page.getByText(copy.passwordShort)).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-up$`, 'u'));
      });

      test('shows an email error for an invalid email', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        await page.getByLabel(copy.email, { exact: true }).fill('not-an-email');
        await page.getByLabel(copy.phone, { exact: true }).fill('2055550145');
        await page.getByLabel(copy.password, { exact: true }).fill('Groceries123');

        await page.getByRole('button', { name: copy.signup, exact: true }).click();

        await expect(page.getByText(copy.emailInvalid)).toBeVisible();
        await expect(page.getByText(copy.phoneInvalid)).toBeHidden();
        await expect(page.getByText(copy.passwordShort)).toBeHidden();
        await expect(page).toHaveURL(new RegExp(`${copy.prefix}/sign-up$`, 'u'));
      });

      test('shows a phone error for a non-numeric phone', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        await page.getByLabel(copy.email, { exact: true }).fill('anna.novak@example.com');
        await page.getByLabel(copy.phone, { exact: true }).fill('abc');
        await page.getByLabel(copy.password, { exact: true }).fill('Groceries123');

        await page.getByRole('button', { name: copy.signup, exact: true }).click();

        await expect(page.getByText(copy.phoneInvalid)).toBeVisible();
        await expect(page.getByText(copy.emailInvalid)).toBeHidden();
        await expect(page.getByText(copy.passwordShort)).toBeHidden();
      });

      test('shows a password error for a short password', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        await page.getByLabel(copy.email, { exact: true }).fill('anna.novak@example.com');
        await page.getByLabel(copy.phone, { exact: true }).fill('2055550145');
        await page.getByLabel(copy.password, { exact: true }).fill('short');

        await page.getByRole('button', { name: copy.signup, exact: true }).click();

        await expect(page.getByText(copy.passwordShort)).toBeVisible();
        await expect(page.getByText(copy.emailInvalid)).toBeHidden();
        await expect(page.getByText(copy.phoneInvalid)).toBeHidden();
      });

      test('clears the field errors once the values become valid', async ({ page }) => {
        await page.goto(`${copy.prefix}/sign-up`);
        await page.getByRole('button', { name: copy.signup, exact: true }).click();
        await expect(page.getByText(copy.emailInvalid)).toBeVisible();

        await page.getByLabel(copy.email, { exact: true }).fill('anna.novak@example.com');
        await page.getByLabel(copy.phone, { exact: true }).fill('2055550145');
        await page.getByLabel(copy.password, { exact: true }).fill('Groceries123');

        await expect(page.getByText(copy.emailInvalid)).toBeHidden();
        await expect(page.getByText(copy.phoneInvalid)).toBeHidden();
        await expect(page.getByText(copy.passwordShort)).toBeHidden();
      });
    });
  });
}
