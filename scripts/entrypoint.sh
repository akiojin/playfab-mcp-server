#!/bin/bash
set -e

REPO_DIR="/playfab-mcp-server"

# 安全なディレクトリ設定
if command -v git >/dev/null 2>&1; then
  git config --global --add safe.directory "$REPO_DIR"
fi

# Gitユーザー情報
if [ -n "$GITHUB_USERNAME" ]; then
  git config --global user.name "$GITHUB_USERNAME"
fi
if [ -n "$GIT_USER_EMAIL" ]; then
  git config --global user.email "$GIT_USER_EMAIL"
fi

# Git資格情報の設定
if [ -n "$GITHUB_USERNAME" ] && [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "https://${GITHUB_USERNAME}:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com" > /root/.git-credentials
  chmod 600 /root/.git-credentials
  git config --global credential.helper store
fi

# GitHub CLI 認証
if [ -n "$GITHUB_TOKEN" ] && command -v gh &> /dev/null; then
  echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null || true
fi

# Codex auth.json 同期
if [ -f /root/.codex-host/auth.json ]; then
  if [ -d /root/.codex/auth.json ]; then
    rm -rf /root/.codex/auth.json
  fi
  if [ ! -f /root/.codex/auth.json ] || [ ! -s /root/.codex/auth.json ] || [ /root/.codex-host/auth.json -nt /root/.codex/auth.json ]; then
    cp /root/.codex-host/auth.json /root/.codex/auth.json
    chmod 600 /root/.codex/auth.json
    echo "✅ Codex auth.json synced from host"
  else
    echo "✅ Codex auth.json is up to date"
  fi
else
  echo "ℹ️ Codex auth.json not found on host (optional)"
fi

cd "$REPO_DIR"

echo "🚀 Docker dev container ready"
echo "   npm ci && npm run build    # ビルド"
echo "   npm start                  # サーバー起動"
echo "   npm test                   # テスト"
echo ""

exec "$@"
