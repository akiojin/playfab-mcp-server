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
- **npmパッケージが足りない場合はインストールを行う** - 必要な依存関係を自動的にインストール
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
