import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { fn } from 'storybook/test';

const router = {
  bfcacheId: 'story',
  back: fn(),
  forward: fn(),
  refresh: fn(),
  hmrRefresh: fn(),
  push: fn(),
  replace: fn(),
  prefetch: fn(),
};

/**
 * Provides a stub App Router to stories, because Storybook's app directory mode breaks on Next 16.
 * @param props - The story content.
 * @returns The content inside an App Router context.
 */
export function StoryAppRouter(props: { children: React.ReactNode }) {
  return <AppRouterContext.Provider value={router}>{props.children}</AppRouterContext.Provider>;
}
