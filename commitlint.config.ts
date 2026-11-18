import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  // Allow an optional Jira key before the type: `GRO-12 feat: add shopping list`
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?:([A-Z][A-Z0-9]+-\d+) )?(\w*)(?:\((.*)\))?!?: (.*)$/u,
      breakingHeaderPattern: /^(?:([A-Z][A-Z0-9]+-\d+) )?(\w*)(?:\((.*)\))?!: (.*)$/u,
      headerCorrespondence: ['ticket', 'type', 'scope', 'subject'],
    },
  },
};

export default Configuration;
