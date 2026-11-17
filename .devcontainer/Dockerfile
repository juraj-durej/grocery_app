FROM node:24-bookworm

ARG PLAYWRIGHT_VERSION=1.62.1
ARG PLAYWRIGHT_MCP_VERSION=0.0.85
ARG FIGMA_MCP_VERSION=0.13.2
ARG CLAUDE_CODE_VERSION=2.1.326

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NEXT_TELEMETRY_DISABLED=1

# System tools + GitHub CLI
RUN apt-get update \
  && apt-get install -y --no-install-recommends git curl jq ca-certificates gnupg less procps unzip \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

# Git pushes over HTTPS authenticate through gh, which reads GH_TOKEN at runtime
RUN git config --system credential.https://github.com.helper '' \
  && git config --system --add credential.https://github.com.helper '!gh auth git-credential' \
  && git config --system --add safe.directory '*' \
  && git config --system push.autoSetupRemote true

# Global CLIs: Claude Code, bun, MCP servers
RUN npm install -g \
    @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} \
    bun \
    @playwright/mcp@${PLAYWRIGHT_MCP_VERSION} \
    figma-developer-mcp@${FIGMA_MCP_VERSION} \
  && npm cache clean --force

# Chromium matching the project's Playwright version (works on arm64 + amd64)
RUN npx -y playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
  && chmod -R a+rX /ms-playwright

# Pre-create dirs that get volumes/binds so they are owned by `node`
RUN mkdir -p /home/node/.npm /home/node/.claude/commands /home/node/.ai \
  && chown -R node:node /home/node

COPY bin/ /usr/local/bin/
RUN chmod +x /usr/local/bin/*

USER node
