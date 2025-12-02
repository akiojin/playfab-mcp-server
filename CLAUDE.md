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
- **Spec Kit（日本語対応版）を必ず使用し、仕様→計画→タスク→実装の順に進める** - `/speckit.*` コマンドや `.specify/scripts/bash/*.sh` を利用
- **ブランチ自動作成は禁止（Worktree設計）** - スクリプトのデフォルトもブランチを作らない; 必要なら明示的に `--branch`
- **できる限り熟考して解決する** - 複雑な問題や改善提案には深い思考と包括的な分析を行う
- **割り込みで別の処理をした後は、必ず残っているタスクの続きを実行する**
- **ビルドエラーは必ず排除する** - TypeScriptコンパイルエラーを放置しない
- **何か更新された場合は、関連するドキュメントを必ず更新する**
- **作業内容は@.agent/PLANS.mdにToDoとしてチェックボックスで残す** - 作業完了時には@.agent/PLANS.mdを更新する
- **作業開始前に進行中タスクに追加・更新する** - 新しい作業を始める前に必ず@.agent/PLANS.mdの進行中タスクを更新
- **タスク完了時にはドキュメントのToDoを更新** - 完了したタスクには[x]を付けて更新（@.agent/PLANS.md）
- **ToDoは@.agent/PLANS.mdに作成する** - タスク管理はすべて@.agent/PLANS.md内で行う
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

## 進捗管理

進行中タスクや完了履歴、改善タスクの詳細は `@.agent/PLANS.md` を参照してください。
