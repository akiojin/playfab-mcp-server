# PlayFab MCP Server 原則

## 基本原則

### I. Spec First, Code After
- 仕様（spec.md）→ 計画（plan.md）→ タスク（tasks.md）→ 実装の順序を厳守する
- Spec Kit CLIとテンプレートを唯一の情報源とし、未承認の実装開始を禁止する

### II. ブランチ自動作成禁止（Worktree設計）
- スクリプトのデフォルトはブランチを作らない。必要なら明示的に `--branch`
- 1タスク=1ブランチ/ワークツリーを意識し、抱き合わせ変更を避ける

### III. テストファースト & Red-Green-Refactor
- 失敗するテストを書き、成功で実装完了を定義する
- 型安全・リトライ・ロギングを含む振る舞いをテストで担保する

### IV. 変更の可観測性と再現性
- ログ、型、リトライ、エラーハンドリングを統一し、再現手順をspec/plan/tasksに残す
- CI/CD（release-please + publish）のパスが品質ゲート

### V. シンプルさ優先
- YAGNIを徹底し、複雑化する場合はspec/planで根拠を明示する

## 開発ワークフロー
- 新規作業は `.specify/scripts/bash/create-new-feature.sh` で雛形を生成する（デフォルトでブランチは作らない）
- 進捗とToDoは `@.agent/PLANS.md` に集約し、specs配下の documents と整合させる
- リリースは develop → main → tag（release-please）→ npm publish の順で自動化する

## ガバナンス
- 原則はCLAUDE.mdのルールと同格で必須。逸脱する場合はspec/planに理由と移行計画を記載する
- 破壊的変更は `feat!` または `BREAKING CHANGE` をコミットとspecに明記する

**バージョン**: 1.0.0 | **承認日**: 2025-12-02 | **最終修正日**: 2025-12-02
