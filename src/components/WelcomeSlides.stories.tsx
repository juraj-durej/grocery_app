import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/locales/en.json';
import nbMessages from '@/locales/nb.json';
import { StoryAppRouter } from './StoryAppRouter';
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
      <StoryAppRouter>
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <Story />
        </NextIntlClientProvider>
      </StoryAppRouter>
    ),
  ],
} satisfies Meta<typeof WelcomeSlides>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Norwegian headings are longer and wrap to more lines. */
export const Norwegian: Story = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nb" messages={nbMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
