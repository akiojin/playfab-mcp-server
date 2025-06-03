# PlayFab MCP サーバープロジェクトガイドライン

## 重要なルール

- **日本語で回答する**
- **エコノミーAPIはv2のみを利用する** - レガシーv1 APIは使用しない
- **ソースコード修正後は必ずビルドしてdistを更新する** - `npm run build`を実行
- **ルールの追加は必ずCLAUDE.mdに追記する**
- **CHANGELOG.mdは英語で記載する**
- **PlayFab REST APIの追加・修正時には必ず公式サイトでパラメーターの整合性を取ること** - https://learn.microsoft.com/ja-jp/rest/api/playfab/?view=playfab-rest
- **markdownlintの警告を全て修正する** - 見出しの前後に空行、コードブロックの言語指定、ファイル末尾改行など
- **一覧のタスクが完了したら、コミットログを自動生成してコミットを行う**
- **コミットログはcommitlint形式で生成する** - type(scope): description の形式
- **コミットログは日本語** - コミットメッセージの説明部分は日本語で記載
- **コミットの際には、必ず承認を取ること** - ユーザーの明示的な許可なしにコミットしない
- **パッケージが足りない場合はインストールを行う** - 必要な依存関係を自動的にインストール
- **モデルは /model opus を優先的に利用するが、レートリミットがかかった場合 /model sonnet で自動的に切り替える**
- **できる限り熟考して解決する** - 複雑な問題や改善提案には深い思考と包括的な分析を行う
- **割り込みで別の処理をした後は、必ず残っているタスクの続きを実行する**
- **ビルドエラーは必ず排除する** - TypeScriptコンパイルエラーを放置しない
- **何か更新された場合は、関連するドキュメントを必ず更新する**
- **作業内容はCLAUDE.mdにToDoとしてチェックボックスで残す** - 作業完了時にはCLAUDE.mdを更新する
- **作業開始前に進行中タスクに追加・更新する** - 新しい作業を始める前に必ずCLAUDE.mdの進行中タスクを更新
- **タスク完了時にはドキュメントのToDoを更新** - 完了したタスクには[x]を付けて更新
- **ToDoはCLAUDE.mdに作成する** - タスク管理はすべてCLAUDE.md内で行う
- **「バージョンアップして」と指示があった場合**:
  1. `git status`でコミットされていない変更がないか確認（変更がある場合はエラー）
  2. 前回のバージョンアップからの差分をCHANGELOG.mdに追加
  3. 変更内容に応じて適切なバージョンタイプを選択:
     - `patch`: バグ修正のみ
     - `minor`: 新機能追加（後方互換性あり）
     - `major`: 破壊的変更
  4. `npm version [patch/minor/major]`を実行

## 概要

AIアシスタントがPlayFabサービスと対話できるようにするModel Context Protocol (MCP)サーバーです。

## プロジェクト構造

```text
/
├── src/                    # TypeScriptソースコード
│   ├── index.ts           # メインエントリーポイント
│   ├── server.ts          # MCPサーバー実装
│   ├── config/            # 設定ファイル
│   │   └── playfab.ts     # PlayFab SDK設定
│   ├── handlers/          # ツールハンドラー実装
│   │   ├── catalog/       # カタログ関連ハンドラー
│   │   ├── inventory/     # インベントリ関連ハンドラー
│   │   ├── player/        # プレイヤー関連ハンドラー
│   │   └── title/         # タイトル関連ハンドラー
│   ├── tools/             # ツール定義
│   │   ├── catalog/       # カタログ関連ツール
│   │   ├── inventory/     # インベントリ関連ツール
│   │   ├── player/        # プレイヤー関連ツール
│   │   └── title/         # タイトル関連ツール
│   ├── types/             # TypeScript型定義
│   │   ├── index.ts       # 共通型定義
│   │   ├── inventory.ts   # インベントリ関連型
│   │   └── playfab-responses.ts # PlayFab APIレスポンス型
│   └── utils/             # ユーティリティ
│       ├── env-validator.ts    # 環境変数検証
│       ├── errors.ts           # カスタムエラークラス
│       ├── input-validator.ts  # 入力検証
│       ├── logger.ts           # ロギングユーティリティ
│       ├── playfab-wrapper.ts  # PlayFab API ラッパー
│       └── router.ts           # ルーターパターン実装
├── __tests__/             # テストファイル
│   └── setup.ts          # Jest設定
├── dist/                  # コンパイル済みJavaScript（gitignore）
├── package.json           # プロジェクト設定と依存関係
├── tsconfig.json          # TypeScript設定
├── jest.config.cjs        # Jest設定
├── eslint.config.mjs      # ESLint設定
├── .editorconfig          # コーディング規約
├── CHANGELOG.md           # 変更履歴
├── CLAUDE.md              # プロジェクトガイドライン
├── README.md              # プロジェクト説明
└── SECURITY.md            # セキュリティポリシー
```

## 環境設定

### 必要な環境変数

```bash
PLAYFAB_TITLE_ID=your_title_id           # PlayFabタイトルID
PLAYFAB_DEV_SECRET_KEY=your_secret_key   # PlayFab開発者シークレットキー
```

### セットアップ手順

```bash
# 依存関係のインストール
npm install

# プロジェクトのビルド
npm run build

# 開発モード（ウォッチ）
npm run watch

# サーバーの起動
npm start

# その他の便利なコマンド
npm run clean          # distディレクトリをクリーンアップ
npm run test           # テストの実行
npm run test:watch     # テストをウォッチモードで実行
npm run test:coverage  # カバレッジレポート付きでテスト実行
npm run lint           # ESLintでコード品質チェック
npm run lint:fix       # ESLintの自動修正
npm run format         # Prettierでコードフォーマット
npm run format:check   # フォーマットチェック（修正なし）
npm run typecheck      # TypeScriptの型チェック
```

## 開発ガイドライン

### コードスタイル

- `.editorconfig`の規約に準拠
- TypeScriptの型定義を厳密に使用
- エラーハンドリングを適切に実装

### コミット前のチェックリスト

1. TypeScriptエラーチェック: `npm run typecheck`
2. Lintエラーの修正: `npm run lint:fix`
3. コードフォーマット: `npm run format`
4. テストの実行: `npm run test`
5. ビルドの成功確認: `npm run build`
6. サーバー起動確認: `npm start`

## PlayFab API統合

### 実装済みAPI

- **カタログ管理**: アイテムカタログの検索と取得
- **プレイヤー管理**: プレイヤー情報の取得と更新
- **インベントリ操作**: アイテムの追加、削除、更新（Economy v2）
- **トランザクション処理**: 購入とアイテム交換（Economy v2）

### API実装規則

1. 新しいAPI統合は以下のパターンに従う：
   - ツール定義は`src/tools/`配下に作成
   - ハンドラー実装は`src/handlers/`配下に作成  
   - `src/server.ts`のルーターに登録
2. すべてのハンドラーは`playfab-wrapper`を使用してAPI呼び出しを行う
3. Economy関連はすべてv2 APIを使用
4. 仮想通貨はインベントリアイテムとして扱う
5. エラーレスポンスは統一フォーマットを使用（`formatErrorResponse`）
6. 入力検証は`input-validator`ユーティリティを使用
7. ロギングは`logger`ユーティリティを使用（構造化ログ）

### APIレート制限

PlayFab APIには呼び出し制限があり、制限を超えるとスロットリングが発生します。

#### Player Entity向けAPI（重要な制限）

- **ExecuteInventoryOperations**: 90秒間で60リクエストまで
- **GetInventoryItems**: 60秒間で100リクエストまで
- **AddInventoryItems**: 60秒間で100リクエストまで
- **その他のInventory API**: 一般的に60秒間で100リクエストまで

#### Title Entity向けAPI（Admin/Server API）

- 一般的にPlayer Entity向けより緩い制限
- **AuthenticateSessionTicket**: 10秒間で10,000リクエストまで

#### 制限回避のベストプラクティス

1. **バッチ処理の活用**: `ExecuteInventoryOperations`や`GrantItemsToUsers`で複数操作をまとめる
2. **適切な間隔**: 連続呼び出しを避け、必要に応じて遅延を入れる
3. **エラーハンドリング**: スロットリングエラー時の適切な再試行ロジック実装
4. **制限監視**: Game Managerの「Limits」タブで現在の制限値を確認

## セキュリティ

### 重要事項

- `.env`ファイルは**絶対にコミットしない**
- APIキーは環境変数で管理
- PlayFab認証情報の安全な保管を徹底
- サーバーサイドAPIのみを使用（クライアントAPIは使用しない）

## コントリビューション

### 開発フロー

1. 既存のissueを確認してから新規作成
2. 既存のコードパターンとスタイルに準拠
3. 機能追加時は対応するドキュメントも更新
4. プルリクエスト前に全テストを実行

### コードレビュー基準

- TypeScript型の適切な使用
- エラーハンドリングの実装
- PlayFab API使用の適切性
- セキュリティベストプラクティスの遵守

## 改善タスク一覧（元の要件）

### 🚨 優先度: 緊急（1週間以内）- 完了済み

1. **server.tsの重複実行を削除** ✅
   - 221-224行目のrunServer()呼び出しを削除
   - エントリーポイントをindex.tsに統一

2. **環境変数の検証強化** ✅
   - TitleIDのフォーマット検証（正規表現: /^[A-F0-9]{5}$/）
   - SecretKeyの長さと強度チェック（最小32文字）

3. **SECURITY.mdのセキュリティ連絡先を追加** ✅
   - GitHubの脆弱性報告機能を使用するよう更新

### 🔥 優先度: 高（2週間以内）- 完了済み

1. **型安全性の向上** ✅
   - PlayFab APIレスポンスの型定義追加（playfab-responses.ts）
   - 入力検証の型定義実装
   - ※38ファイルのany型置き換えは継続的な改善項目

2. **エラーハンドリングの統一** ✅
   - すべてのハンドラーでplayfab-wrapperを使用（28ファイル更新）
   - エラーレスポンスフォーマットの統一（formatErrorResponse実装）
   - スタックトレースの本番環境での非表示化

3. **テストの実装開始** ✅
   - 各ハンドラーのユニットテスト作成（基本実装）
   - PlayFab APIのモック実装
   - Jest設定の最適化

### ⚡ 優先度: 中（1ヶ月以内）- 一部完了

1. **ルーターパターンの実装** ✅
   - server.tsの巨大なswitch文をマップベースのルーターに変更
   - ハンドラーの自動登録機能（registerBatch）
   - ミドルウェアサポートの追加（withLogging、withValidation、withRetry）

2. **トークンキャッシュメカニズム** 🚧
   - GetEntityTokenの結果をキャッシュ（基本実装済み）
   - トークン有効期限の管理（実装済み）
   - ※さらなる最適化は継続的な改善項目

3. **ロギングシステムの導入** ✅
   - pinoによる構造化ログ実装
   - 環境別のログレベル設定
   - 機密情報のマスキング機能

### 📈 優先度: 低（3ヶ月以内）

1. **CI/CDパイプラインの強化**
   - GitHub Actionsでのテスト自動実行
   - カバレッジレポートの生成
   - Dependabotによる依存関係の自動更新

2. **APIドキュメントの自動生成**
   - OpenAPI仕様の作成
   - TypeDocによるコードドキュメント生成
   - 使用例とベストプラクティスの文書化

3. **パフォーマンス最適化**
   - API呼び出しの並列化
   - レスポンスキャッシュの実装
   - レート制限対策の自動再試行ロジック

### 📋 技術的負債の解消

1. **コードの重複削除**
   - handlers/とtools/の責務を明確に分離
   - 共通処理のユーティリティ関数化

2. **依存関係の更新**
   - @types/dotenvの削除（dotenv本体の型定義を使用）
   - すべての依存関係を最新版に更新

3. **TODOコメントの解決**
   - 9個の未解決TODOを順次対応
   - マイグレーション作業の完了

## 作業履歴

### 完了タスク

- [x] **GitHub Actions エラー修正**（2025/6/3）
  - auto-merge-dependabot.yml で DEPENDABOT_PAT が設定されている場合のみ PR を承認するように条件を追加
  - README.md に DEPENDABOT_PAT の設定方法を追記
  - server.ts のビルドエラーを修正（GetCatalogConfig と GetAllSegments の引数削除）

- [x] **セキュリティ強化と型安全性向上**（2025/6/3）
  - SECURITY.md にGitHubの脆弱性報告機能を使用するよう更新
  - 本番環境でのスタックトレース非表示化を実装
  - 入力検証ユーティリティ（input-validator.ts）を作成
  - 2つのハンドラー（search-items, add-inventory-items）に入力検証を実装
  - PlayFab APIレスポンスの包括的な型定義を作成（playfab-responses.ts）

- [x] **高優先度タスクの実装**（2025/6/3）
  - Jest設定の最適化とテスト実装（input-validator, errors, playfab-wrapperのテスト作成）
  - すべてのハンドラーでplayfab-wrapper使用（28ファイル更新）
  - ロギングシステムの導入（pinoによる構造化ログ、パフォーマンス計測、機密情報マスキング）
  - ルーターパターンの実装（ToolRouterクラスでswitch文を置き換え、ミドルウェアサポート追加）

- [x] **ドキュメントの整合性修正**（2025/6/3）
  - CLAUDE.mdのプロジェクト構造を実際のディレクトリ構造に更新
  - API実装規則にplayfab-wrapper使用やロギング、入力検証の記載を追加
  - セットアップ手順にすべてのnpm scriptsを記載（test、lint、format等）
  - コミット前のチェックリストを現在の開発ワークフローに合わせて更新

- [x] **型安全性とリトライロジックの完全実装**（2025/6/3）
  - HandlerParams<T>とHandlerResponse<T>の汎用型定義を実装
  - PlayFab固有のリトライロジックを実装（retry.ts作成、exponential backoff、レート制限対応）
  - callPlayerAPI、callAdminAPI、callBulkAPIの便利関数を追加
  - ツール入力スキーマから型定義を生成するユーティリティを実装（schema-types.ts）
  - 主要ツールの型安全なパラメーター定義を作成（tool-params.ts）
  - 包括的なテストスイートを作成（123テスト、ユーティリティ90%以上のカバレッジ）

- [x] **大規模なany型削減とハンドラーの型安全性向上**（2025/6/3）
  - 38ファイルでany型を削減し、適切な型定義に置き換え
  - すべてのハンドラーをPlayFabHandler型を使用するconst式に変更
  - handler-types.tsを新規作成し、ハンドラー専用の型定義を集約
  - router.tsをジェネリック化し、型安全なミドルウェアチェーンを実現
  - catalogハンドラー（8ファイル）、inventoryハンドラー（7ファイル）、playerハンドラー（7ファイル）、titleハンドラー（6ファイル）を全面的に型安全化

- [x] **依存性注入パターンの完全実装**（2025/6/3）
  - Containerクラスを実装（singleton/transientのサポート、子コンテナ機能）
  - BaseHandlerクラスを実装（DIを活用した基底クラス、統一的なエラーハンドリング）
  - di-setupモジュールを作成（PlayFab API、ロガー、設定の注入）
  - HandlerFactoryを実装（ハンドラーの登録と管理）
  - 全ハンドラーのDI版を作成（catalog: 9個、inventory: 8個、player: 8個、title: 7個）
  - 包括的なテストスイートを作成（29テスト全て合格）
  - 段階的移行戦略の実装（既存のserver.tsでDIハンドラーを選択的に使用可能）


## 進行中のタスク

### 🔧 現在作業中

- [x] **38ファイルのany型解消**（完了）
  - [x] router.ts、errors.ts、playfab-wrapper.ts、retry.tsのany型修正
  - [x] titleハンドラー5ファイルのany型修正
  - [x] catalogハンドラー8ファイルのany型修正
  - [x] inventoryハンドラーのany型修正（7ファイル完了）
  - [x] playerハンドラーのany型修正（7ファイル完了）
  - [x] types/playfab-responses.tsのany型修正
  - [x] types/inventory.tsのany型修正
  - 残り15箇所は主にテストファイルやSDKの型定義に依存する部分

- [x] **依存性注入パターンの導入**（完了）
  - [x] DIコンテナの実装（Container クラス作成、singleton/transient サポート）
  - [x] PlayFab APIクライアントの注入（di-setup.ts で設定）
  - [x] ロガーの注入（HandlerContext 経由で提供）
  - [x] 設定の注入（AppConfig として管理）
  - [x] BaseHandler クラスの実装（DI を活用した基底クラス）
  - [x] HandlerFactory の実装（ハンドラーの登録と管理）
  - [x] SearchItemsHandler のDI版実装（search-items-di.ts）
  - [x] GetUserDataHandler のDI版実装（get-user-data-di.ts）
  - [x] GetItemHandler のDI版実装（get-item-di.ts）
  - [x] DIコンテナのテスト実装（container.test.ts、di-setup.test.ts、base-handler.test.ts）
  - [x] 既存ハンドラーのDI対応への移行（全カテゴリ（catalog/inventory/player/title）の-di.tsファイル作成）
  - [x] server.ts のルーターとDIの統合（段階的移行方式を採用）
- [x] **handlersとtoolsの完全統合**（完了）
  - 段階的にDIハンドラーへ移行できるようindex.tsを調整
- [ ] **並列API呼び出しの実装**（未着手）

## 今後の改善タスク一覧

### 🚨 優先度: 緊急（継続的改善）

- [x] **セキュリティの強化**（基本実装完了）
  - [x] SECURITY.mdにセキュリティ連絡先を追加（GitHub脆弱性報告機能）
  - [x] 本番環境でのスタックトレース非表示化
  - [x] 入力検証の実装（input-validator.ts作成、2ハンドラーに実装）
  - [ ] MCPサーバー接続の認証メカニズム追加（将来の拡張）

- [ ] **型安全性の向上**（38ファイルのany型解消）
  - [x] PlayFab APIレスポンスの型定義作成（playfab-responses.ts）
  - [ ] HandlerParams<T>とHandlerResponse<T>の汎用型定義
  - [ ] ツール入力スキーマの型生成
  - [x] エラー型の完全な定義（errors.ts）

### 🔥 優先度: 高（2週間以内）

- [x] **テスト実装**（基本実装完了）
  - [x] Jest設定の最適化（ESモジュール対応、カバレッジ設定）
  - [x] 各ハンドラーのユニットテスト作成（search-itemsのテスト実装）
  - [x] PlayFab APIのモック実装（playfab-sdk モック作成）
  - [x] ユーティリティのテスト実装（input-validator, errors, playfab-wrapper）
  - [ ] カバレッジ目標: 80%以上（現在実装中）

- [x] **エラーハンドリングの統一**（基本実装完了）
  - [x] すべてのハンドラーでplayfab-wrapperを使用（28ファイル更新完了）
  - [x] エラーレスポンスフォーマットの統一（formatErrorResponse実装済み）
  - [ ] リトライロジックの実装
  - [x] カスタムエラークラスの活用（errors.tsで実装済み）

- [x] **ロギングシステムの導入**（完了）
  - [x] pinoによる構造化ログ実装
  - [x] 環境別ログレベル設定（production: info, development: debug, test: warn）
  - [x] 機密情報のマスキング（パスワード、トークン、APIキーなど）
  - [x] リクエスト/レスポンスログ（PlayFab API呼び出しとMCPツール呼び出し）
  - [x] パフォーマンスメトリクス記録（PerformanceLoggerクラス実装）

### ⚡ 優先度: 中（1ヶ月以内）

- [x] **アーキテクチャの改善**（完了）
  - [x] server.tsの巨大switch文をルーターパターンに変更（ToolRouterクラス実装）
  - [x] ハンドラーの自動登録機能（registerBatchメソッド）
  - [x] ミドルウェアサポート（compose、withLogging、withValidation、withRetry）
  - [x] 依存性注入パターンの導入（Container、BaseHandler、HandlerFactory実装）
  - [x] handlersとtoolsの完全統合

- [ ] **パフォーマンス最適化**
  - [x] GetEntityTokenのキャッシュ実装（playfab-wrapper.tsで実装済み）
  - [ ] API応答のキャッシュ戦略
  - [ ] 並列API呼び出しの実装
  - [ ] リクエストの重複排除
  - [ ] バッチ処理の最適化

- [ ] **開発体験の向上**
  - [ ] pre-commitフックの設定（lint、format、test）
  - [ ] VS Code推奨拡張機能の設定
  - [ ] デバッグ設定の追加
  - [ ] 開発用Dockerコンテナ
  - [ ] ホットリロード機能

### 📈 優先度: 低（3ヶ月以内）

- [ ] **CI/CDパイプラインの強化**
  - [ ] GitHub Actionsでの自動テスト
  - [ ] コードカバレッジレポート（Codecov）
  - [ ] セキュリティスキャン（Snyk/OWASP）
  - [ ] パフォーマンスベンチマーク
  - [ ] 自動リリースノート生成

- [ ] **ドキュメントの充実**
  - [ ] API仕様書の自動生成（TypeDoc）
  - [ ] 使用例とベストプラクティス
  - [ ] トラブルシューティングガイド
  - [ ] アーキテクチャ図
  - [ ] 動画チュートリアル

- [ ] **運用機能の追加**
  - [ ] ヘルスチェックエンドポイント
  - [ ] メトリクス収集（Prometheus形式）
  - [ ] 分散トレーシング対応
  - [ ] グレースフルシャットダウン
  - [ ] 設定のホットリロード

### 🧹 技術的負債の解消

- [ ] **コードの最適化**
  - [ ] 9個のTODOコメントの解決
  - [ ] 未使用コードの削除
  - [ ] 重複コードのリファクタリング
  - [ ] 複雑度の高い関数の分割
  - [ ] 命名規則の統一

- [ ] **依存関係の管理**
  - [ ] すべての依存関係を最新版に更新
  - [ ] 不要な依存関係の削除
  - [ ] セキュリティ脆弱性の解消
  - [ ] ライセンス互換性の確認
  - [ ] パッケージサイズの最適化

- [ ] **API設計の改善**
  - [ ] レスポンスフォーマットの統一
  - [ ] APIバージョニング戦略
  - [ ] ページネーションヘルパー
  - [ ] バッチ操作ユーティリティ
  - [ ] GraphQL対応の検討

### 🚀 将来の拡張機能

- [ ] **新機能の追加**
  - [ ] WebSocket/リアルタイム通信サポート
  - [ ] マルチテナント対応
  - [ ] プラグインシステム
  - [ ] CLI管理ツール
  - [ ] Web管理画面

- [ ] **エコシステムの拡充**
  - [ ] 他のMCPサーバーとの連携
  - [ ] PlayFab以外のゲームサービス対応
  - [ ] コミュニティプラグイン
  - [ ] マーケットプレイス
  - [ ] 公式Dockerイメージ
