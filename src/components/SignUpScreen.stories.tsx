import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/locales/en.json';
import nbMessages from '@/locales/nb.json';
import { SignUpScreen } from './SignUpScreen';
import { StoryAppRouter } from './StoryAppRouter';

const meta = {
  title: 'Components/SignUpScreen',
  component: SignUpScreen,
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
} satisfies Meta<typeof SignUpScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Norwegian copy. */
export const Norwegian: Story = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nb" messages={nbMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
