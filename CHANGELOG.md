# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0](https://github.com/akiojin/playfab-mcp-server/compare/v1.0.0...v1.1.0) (2025-12-03)


### Features

* **skills:** Claude Code向けSkillsをプロジェクトに追加 ([1a20b42](https://github.com/akiojin/playfab-mcp-server/commit/1a20b42dfad9b383ea13ac6721c21693595e1779))
* **skills:** Claude Code向けSkillsをプロジェクトに追加 ([96cf529](https://github.com/akiojin/playfab-mcp-server/commit/96cf5290cfc2dfb7bb0e2f6bd404c73589b5a8fb))


### Bug Fixes

* **deps:** MCP SDKと脆弱性パッケージを更新 ([00aa052](https://github.com/akiojin/playfab-mcp-server/commit/00aa05227a63e0cabec69ef7bdf893c809b8c275))

## 1.0.0 (2025-12-02)


### ⚠ BREAKING CHANGES

* **types:** ハンドラー関数のシグネチャが変更されました。カスタムハンドラーは新しいPlayFabHandler型に合わせて更新が必要です。
* **core:** ハンドラーの型定義が変更されました。既存のカスタムハンドラーは新しい型定義に合わせて更新が必要です。
* **dev-tools:** TypeScript strict mode may require code adjustments in dependent projects

### Features

* API呼び出しにCustomTagsを追加し、MCPトラッキングを強化 ([6efce4f](https://github.com/akiojin/playfab-mcp-server/commit/6efce4f14f829c391d8de1afa055e78530f3bc8d))
* **core:** implement comprehensive improvements for security, testing, and architecture ([a637c4f](https://github.com/akiojin/playfab-mcp-server/commit/a637c4f088a8ed7e16289da4f5a6105b9f8ff2f5))
* **core:** 型安全性の向上とPlayFab固有のリトライロジックを実装 ([fb221ab](https://github.com/akiojin/playfab-mcp-server/commit/fb221ab319e3ce9afcbb235a3c967684ce362b85))
* **dev-tools:** add comprehensive development tooling and code quality setup ([4164a65](https://github.com/akiojin/playfab-mcp-server/commit/4164a65f687b85ad397c281262f86f64c64c0082))
* **di:** 依存性注入パターンの実装 ([e0c0ed6](https://github.com/akiojin/playfab-mcp-server/commit/e0c0ed6c62844cb4c5b474a2368d730257ac212c))
* GET_TITLE_PLAYER_ACCOUNT_IDS_FROM_PLAYFAB_IDS_TOOLのスキーマを改善 ([64fb427](https://github.com/akiojin/playfab-mcp-server/commit/64fb4274487e0692d46911516b92653a5a2231d1))
* **handlers:** 全ハンドラーのDI版を実装し段階的移行を可能に ([6f74079](https://github.com/akiojin/playfab-mcp-server/commit/6f740798a9b58e604a1cf03b83c5728ceb000d10))
* **rules:** add automatic model switching rule ([6093113](https://github.com/akiojin/playfab-mcp-server/commit/60931134d4d67b470ef2adce1d75cf556d767a32))
* **rules:** add ultrathink rule and update model switching command ([2f81f2b](https://github.com/akiojin/playfab-mcp-server/commit/2f81f2b17119f5c0f0940468599cd59125795116))
* アイテム追加ツールの説明を更新 ([a35c7d6](https://github.com/akiojin/playfab-mcp-server/commit/a35c7d688f22deec6672f21493c6f991643b81a8))
* カタログアイテムのタイトルにNEUTRALロケールの必須性を追加 ([adc5ca7](https://github.com/akiojin/playfab-mcp-server/commit/adc5ca7f9b5bba8e5916d614855024a1cee0cf62))
* カタログアイテム作成および更新機能の強化 ([327edc5](https://github.com/akiojin/playfab-mcp-server/commit/327edc5eee84bc8edd08bab159fae12771c5a298))
* ツールの説明と確認フラグを追加 ([2a06bf8](https://github.com/akiojin/playfab-mcp-server/commit/2a06bf85df0aa79609e2038d07dc7999a15da8d5))
* バージョンアップ手順をCLAUDE.mdに追加 ([4dfcaaa](https://github.com/akiojin/playfab-mcp-server/commit/4dfcaaa0920e27ffd79a81a5b4e2b357ad72da34))
* 新しいツール「add_localized_news」と「get_title_news」を追加 ([4547f87](https://github.com/akiojin/playfab-mcp-server/commit/4547f87dee69f911904d8cbf4726533b4d1cb0ea))
* 新しいツールの追加と既存ツールの説明を更新 ([bd808ff](https://github.com/akiojin/playfab-mcp-server/commit/bd808ff37a7b9847875cbe144045b68f67c688a1))


### Bug Fixes

* **ci:** commitlintジョブをnpm実行に統一 ([b5bd12e](https://github.com/akiojin/playfab-mcp-server/commit/b5bd12e10327bd88391cf6aa170d0c998ae7809c))
* **ci:** commitlint依存を追加 ([22ccca0](https://github.com/akiojin/playfab-mcp-server/commit/22ccca07e240505c09b994df7cf3537b11bc35f4))
* **ci:** commitlint設定を追加 ([4516a3a](https://github.com/akiojin/playfab-mcp-server/commit/4516a3a490749e48817631df1c0d926c6565ede6))
* **ci:** Dockerfileをgwt仕様に合わせpnpm/bunを導入 ([eaa9699](https://github.com/akiojin/playfab-mcp-server/commit/eaa969986745b9abdc912ebec0ce0bedcebd36db))
* **ci:** gwt由来のGitHub設定とClaudeコマンドを適用 ([a075d6e](https://github.com/akiojin/playfab-mcp-server/commit/a075d6e195ee9066d1365535a8eca8ac6a5a5e93))
* **ci:** lint/testをnpm実行に切替 ([7d37929](https://github.com/akiojin/playfab-mcp-server/commit/7d379293cd4817ef38169b09341dc4d77eeffdcb))
* **ci:** markdownlint設定を追加 ([bca5e74](https://github.com/akiojin/playfab-mcp-server/commit/bca5e7467468b6062505210755bd723c11720bc7))
* **ci:** prevent GitHub Actions PR approval errors for Dependabot ([caebe76](https://github.com/akiojin/playfab-mcp-server/commit/caebe76ccccfa45519c2b63341016cdb8609fe81))
* **ci:** use PAT for Dependabot PR auto-approval ([fee4da3](https://github.com/akiojin/playfab-mcp-server/commit/fee4da3d6e98bcc6bad1a9c0d19d0a04c404e050))
* **ci:** use pull_request_target for Dependabot workflows ([cfac49a](https://github.com/akiojin/playfab-mcp-server/commit/cfac49a01ff93b2b6e8558d58222d874142c330e))
* **deps:** pino v10 に合わせて型整合 ([e2f1791](https://github.com/akiojin/playfab-mcp-server/commit/e2f1791481886958cf53900067a6d57da00baf66))
* GET_ALL_SEGMENTS_TOOLの説明を詳細化し、API呼び出しにおけるセグメントIDの重要性を明記しました。 ([9edbbb2](https://github.com/akiojin/playfab-mcp-server/commit/9edbbb22095c8c9e358137f82fe98109874b1c88))
* **handlers:** pino v10のAPI変更に対応 ([657b312](https://github.com/akiojin/playfab-mcp-server/commit/657b312033c217da326559d606896f5fe1dc7e37))
* initial commit. ([ea62341](https://github.com/akiojin/playfab-mcp-server/commit/ea62341b85a53fb38eaba847f0a970e1a9a830e1))
* **lint:** gwt準拠の緩和設定でCIを通過 ([52182c6](https://github.com/akiojin/playfab-mcp-server/commit/52182c6b46fc54bca701c4f8c597ad83e2eeb22a))
* **logger:** ログ出力先をstderrに変更（MCP仕様準拠） ([8b8b212](https://github.com/akiojin/playfab-mcp-server/commit/8b8b212a9f412bc5709d7e40e84decdaae05c5a7))
* package.jsonにprivateフィールドを追加しました。 ([a4b62ed](https://github.com/akiojin/playfab-mcp-server/commit/a4b62ed738ff105b0bd7d80b069094679ffb6051))
* package.jsonに説明とライセンスを追加し、バイナリ名を変更しました。 ([ebae910](https://github.com/akiojin/playfab-mcp-server/commit/ebae9103d4df0b8c69b40571d6e86883f78d7e19))
* package.jsonの名前を変更し、スコープを追加しました。 ([94a6bbc](https://github.com/akiojin/playfab-mcp-server/commit/94a6bbc79f0df6086f925b235eebae0442b1a291))


### Code Refactoring

* **types:** 大規模なany型削減とハンドラーの型安全性向上 ([3624791](https://github.com/akiojin/playfab-mcp-server/commit/36247911f05da7a94853992726d0ad15c717abac))

## [Unreleased]

### Changed

- Consolidated news management tools for better usability
  - Removed `add_news` tool in favor of unified `add_localized_news` tool
  - Enhanced `add_localized_news` to automatically handle base news creation and localization in a single operation
  - Improved error handling with specific guidance for PlayFab configuration requirements
- Enhanced error messages for PlayFab API errors
  - Added specific error handling for default language configuration issues (error code 1393)
  - Provides clear guidance on PlayFab Game Manager configuration requirements

### Removed

- `add_news` tool (functionality merged into `add_localized_news`)

## [0.5.0] - 2024-12-19

### Added

- Batch operations support for catalog items and inventory management
  - `batch_create_draft_items`: Create multiple catalog items in a single operation (up to 50 items)
  - `grant_items_to_users`: Grant items to multiple players in bulk (up to 100 operations)
- Enhanced `get_title_player_account_ids_from_playfab_ids` tool
  - Now supports both single ID and multiple IDs (array) input
  - Returns detailed mapping of PlayFabIds to TitlePlayerAccountIds
- Catalog configuration management
  - `update_catalog_config`: Define available ContentTypes and Tags for catalog items
  - `get_catalog_config`: Retrieve current catalog configuration
- Custom tags support for API tracking
  - All PlayFab API calls now include `CustomTags: { mcp: 'true' }` for tracking
- Destructive operation protection
  - Added confirmation requirements for `delete_item`, `ban_users`, and `delete_inventory_items`
  - Clear warning messages and safety measures to prevent accidental data loss

### Enhanced

- Improved tool descriptions with clear categorization (⚡ BULK OPERATION, ⚠️ DESTRUCTIVE, etc.)
- Enhanced `create_draft_item` to enforce NEUTRAL locale requirement for titles
- Updated `execute_inventory_operations` description to highlight bulk operation capabilities
- Deprecated single-operation tools in favor of unified batch tools:
  - `create_draft_item` → Use `batch_create_draft_items` instead
  - `add_inventory_items` → Use `grant_items_to_users` instead

### Fixed

- Fixed TypeScript compilation errors
- Corrected JSON Schema definitions for tools accepting multiple types

## [0.4.0] - Previous Release
