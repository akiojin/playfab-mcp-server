# Repository Configuration

このディレクトリは GitHub リポジトリ設定をコード管理するための場所です。

## ファイル構成

```
.github/config/
├── README.md                      # このファイル
├── repo.json                      # リポジトリ全体の設定
└── branch-protection/
    ├── main.json                  # main ブランチ保護ルール
    └── develop.json               # develop ブランチ保護ルール
```

## 適用手順

[twelvelabs/gh-repo-config](https://github.com/twelvelabs/gh-repo-config) を利用します。

```bash
gh extension install twelvelabs/gh-repo-config
# 設定適用
gh repo-config apply
```

## ブランチ保護ポリシー

### main
- PR 必須（直 push 禁止）
- Required Checks:
  - build (18.x)
  - build (20.x)
  - build (22.x)
  - security
  - ESLint & Prettier
  - Commit Message Lint
  - Test (npm)
  - Build
- レビュー: コードオーナー必須 + 1 承認

### develop
- PR 必須（直 push 禁止）
- Required Checks:
  - ESLint & Prettier
  - Commit Message Lint
  - Test (npm)
  - Build
- レビュー: コードオーナー必須 + 1 承認

## リリースフロー

```
feature → develop (PR + CI)
    ↓
prepare-release で develop→main PR 自動作成/マージ
    ↓
release-please が main にタグ/Release PR を作成
    ↓
publish ワークフローがタグ push で npm へ配布
```
