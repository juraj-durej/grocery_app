import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import enMessages from '@/locales/en.json';
import nbMessages from '@/locales/nb.json';
import { SignOutRow } from './SignOutRow';

const meta = {
  title: 'Components/SignOutRow',
  component: SignOutRow,
  args: { label: enMessages.AccountPage.sign_out },
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: false } },
  decorators: [
    (Story) => (
      <div className="w-103.5 bg-shop-page py-4">
        <ul aria-label={enMessages.AccountPage.menu_label}>
          <li>
            <Story />
          </li>
        </ul>
      </div>
    ),
  ],
} satisfies Meta<typeof SignOutRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Sign out' });

    await expect(button).toBeVisible();
    await expect(canvas.queryByRole('img')).toBeNull();
    await userEvent.click(button);
  },
};

/** The label comes from the Norwegian messages. */
export const Norwegian: Story = {
  args: { label: nbMessages.AccountPage.sign_out },
};
