import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/locales/en.json';
import frMessages from '@/locales/fr.json';
import { GetStartedButton } from './GetStartedButton';
import { StoryAppRouter } from './StoryAppRouter';

const meta = {
  title: 'Components/GetStartedButton',
  component: GetStartedButton,
  args: { carouselId: 'welcome-slides', total: 4 },
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
} satisfies Meta<typeof GetStartedButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The label comes from the French messages. */
export const French: Story = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="fr" messages={frMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};
