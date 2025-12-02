# Node.js 22 (LTS) ベースイメージ
FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
    jq \
    vim \
    ripgrep \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 開発支援ツール（npmベース）
RUN npm install -g \
    typescript@latest \
    eslint@latest \
    prettier@latest \
    @commitlint/cli@latest \
    @commitlint/config-conventional@latest

# uv/uvx (Spec Kit CLI用)
RUN curl -fsSL https://astral.sh/uv/install.sh | bash
ENV PATH="/root/.cargo/bin:${PATH}"

# GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list && \
    apt-get update && \
    apt-get install -y gh && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /playfab-mcp-server

# エントリーポイント
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
