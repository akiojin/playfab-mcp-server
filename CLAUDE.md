# PlayFab MCP サーバープロジェクトガイドライン

## 重要なルール
- **日本語で回答する**
- **エコノミーAPIはv2のみを利用する** - レガシーv1 APIは使用しない
- **ソースコード修正後は必ずビルドしてdistを更新する** - `npm run build`を実行
- **ルールの追加は必ずCLAUDE.mdに追記する**

## 概要
AIアシスタントがPlayFabサービスと対話できるようにするModel Context Protocol (MCP)サーバーです。

## プロジェクト構造
```
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