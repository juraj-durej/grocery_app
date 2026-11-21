import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // shadcn/ui primitives are installed ahead of use, treat them as entry points
  entry: ['src/components/ui/**/*.tsx'],
  // Files to exclude from Knip analysis
  ignore: [
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    // Kept for upcoming features (i18n navigation)
    'src/libs/I18nNavigation.ts',
  ],
  ignoreDependencies: [
    // Provides the pglite-server binary, invoked via `sh -c` so Knip can't detect it
    '@electric-sql/pglite-socket',
    // Kept for upcoming features (component tests)
    'vitest-browser-react',
  ],
  // Include custom Playwright test file suffixes
  playwright: {
    entry: ['tests/**/*.@(integ|e2e).ts'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
