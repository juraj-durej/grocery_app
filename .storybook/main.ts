import path from 'node:path';
import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  features: {
    experimentalRSC: true,
  },
  // Server actions import the DB, so stories get a browser-safe mock instead
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@/actions/AuthActions': path.resolve(import.meta.dirname, 'AuthActions.mock.ts'),
        },
      },
    }),
  core: {
    disableTelemetry: true,
  },
};
export default config;
