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
- **コミットの際には、必ず承認を取ること** - ユーザーの明示的な許可なしにコミットしない
- **パッケージが足りない場合はインストールを行う** - 必要な依存関係を自動的にインストール
- **モデルは /model opus を優先的に利用するが、レートリミットがかかった場合 /model sonnet で自動的に切り替える**
- **できる限りultrathinkで解決する** - 複雑な問題や改善提案には深い思考と包括的な分析を行う
- **割り込みで別の処理をした後は、必ず残っているタスクの続きを実行する**
- **ビルドエラーは必ず排除する** - TypeScriptコンパイルエラーを放置しない
- **何か更新された場合は、関連するドキュメントを必ず更新する**
- **作業内容はCLAUDE.mdにToDoとしてチェックボックスで残す** - 作業完了時にはCLAUDE.mdを更新する
- **作業開始前に進行中タスクに追加・更新する** - 新しい作業を始める前に必ずCLAUDE.mdの進行中タスクを更新
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
├── src/              # TypeScriptソースコード
│   └── index.ts      # メインサーバー実装
├── dist/             # コンパイル済みJavaScript（gitignore）
├── package.json      # プロジェクト設定と依存関係
├── tsconfig.json     # TypeScript設定
└── .editorconfig     # コーディング規約
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
```

## 開発ガイドライン

### コードスタイル

- `.editorconfig`の規約に準拠
- TypeScriptの型定義を厳密に使用
- エラーハンドリングを適切に実装

### コミット前のチェックリスト

1. ビルドの成功確認: `npm run build`
2. TypeScriptエラーチェック: `npx tsc --noEmit`
3. サーバー起動確認: `npm start`

## PlayFab API統合

### 実装済みAPI

- **カタログ管理**: アイテムカタログの検索と取得
- **プレイヤー管理**: プレイヤー情報の取得と更新
- **インベントリ操作**: アイテムの追加、削除、更新（Economy v2）
- **トランザクション処理**: 購入とアイテム交換（Economy v2）

### API実装規則

1. 新しいAPI統合は`src/index.ts`の既存パターンに従う
2. Economy関連はすべてv2 APIを使用
3. 仮想通貨はインベントリアイテムとして扱う
4. エラーレスポンスは統一フォーマットを使用

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

## 改善タスク一覧

### 🚨 優先度: 緊急（1週間以内）

1. **server.tsの重複実行を削除**
   - 221-224行目のrunServer()呼び出しを削除
   - エントリーポイントをindex.tsに統一

2. **環境変数の検証強化**
   - TitleIDのフォーマット検証（正規表現: /^[A-F0-9]{5}$/）
   - SecretKeyの長さと強度チェック（最小32文字）

3. **SECURITY.mdのセキュリティ連絡先を追加**
   - メールアドレスとGPGキーの設定

### 🔥 優先度: 高（2週間以内）

1. **型安全性の向上**
   - 38ファイルのany型を具体的な型定義に置き換え
   - HandlerParams<T>とHandlerResponse<T>の型定義作成
   - PlayFab APIレスポンスの型定義追加

2. **エラーハンドリングの統一**
   - すべてのハンドラーでplayfab-wrapperを使用
   - エラーレスポンスフォーマットの統一
   - スタックトレースの本番環境での非表示化

3. **テストの実装開始**
   - 各ハンドラーのユニットテスト作成
   - PlayFab APIのモック実装
   - 最低限のカバレッジ目標: 60%

### ⚡ 優先度: 中（1ヶ月以内）

1. **ルーターパターンの実装**
   - server.tsの巨大なswitch文をマップベースのルーターに変更
   - ハンドラーの自動登録機能
   - ミドルウェアサポートの追加

2. **トークンキャッシュメカニズム**
   - GetEntityTokenの結果をキャッシュ
   - トークン有効期限の管理
   - 自動更新機能の実装

3. **ロギングシステムの導入**
   - winstonまたはpinoによる構造化ログ
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

### 進行中タスク

- [x] **コードのモジュラー化とリファクタリング**（基本構造完了）
  - [x] server.tsの重複実行を削除（221-224行目のrunServer()呼び出しを削除済み）
  - [x] 必要な依存ファイルの作成
    - [x] src/config/playfab.ts - PlayFab API設定ファイル（既存）
    - [x] src/utils/errors.ts - エラーハンドリングユーティリティ（既存）
    - [x] src/utils/env-validator.ts - 環境変数検証（既存）
  - [x] handlersディレクトリ構造の実装（基本構造作成済み）
  - [ ] toolsディレクトリとhandlersディレクトリの統合（将来の改善項目）
  - [x] PlayFab APIラッパー（playfab-wrapper.ts）の実装
  - [x] 環境変数の検証強化（TitleIDとSecretKeyのフォーマット検証）
    - TitleID: 5文字の16進数形式（/^[A-F0-9]{5}$/）
    - SecretKey: 最小32文字
  - [x] 不要な一時ファイルの削除
    - [x] refactor-script.js, refactor-script.ts, refactor.cjs
    - [x] src/index.ts.backup
    - [x] scripts/migrate-tools.ts

- [ ] **改善タスク一覧の実装**
  - [ ] 🚨 環境変数の検証強化
  - [ ] 🚨 SECURITY.mdのセキュリティ連絡先を追加
