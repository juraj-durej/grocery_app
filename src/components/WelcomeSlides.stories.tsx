import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/locales/en.json';
import frMessages from '@/locales/fr.json';
import { WelcomeSlides } from './WelcomeSlides';

const meta = {
  title: 'Components/WelcomeSlides',
  component: WelcomeSlides,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: false },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof WelcomeSlides>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** French headings are longer and wrap to more lines. */
export const French: Story = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="fr" messages={frMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
