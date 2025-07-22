# StorybookでMSWエラーを修正する手順

## 🚨 問題の原因

「エラー: Failed to fetch users」が表示される原因は以下の通りです：

1. **`msw-storybook-addon`がインストールされていない**
2. **`public/mockServiceWorker.js`が存在しない**
3. **Storybook preview.tsでMSWが初期化されていない**

## 📝 修正手順

### ステップ1: 必要なパッケージをインストール

```bash
# msw-storybook-addonをインストール
pnpm add -D msw-storybook-addon
```

### ステップ2: MSW Service Workerファイルを生成

```bash
# package.jsonにスクリプトが定義されているので、それを使用
pnpm msw:init

# または直接実行
npx msw init public/ --save
```

これにより、`public/mockServiceWorker.js`が生成されます。

### ステップ3: Storybookを再起動

```bash
# Storybookを停止（Ctrl+C）してから再起動
pnpm storybook
```

## ✅ 確認方法

1. ブラウザで http://localhost:6006 を開く
2. 左サイドバーから「Components > UserList > Default」を選択
3. 「田中太郎」「鈴木花子」「佐藤次郎」のユーザーリストが表示されることを確認

## 🔧 追加の設定（オプション）

### グローバルCSS/Tailwindの適用

もしStorybookでスタイルが正しく表示されない場合は、`.storybook/preview.ts`に以下を追加：

```typescript
// .storybook/preview.ts
import '../src/app/globals.css'; // グローバルCSSのインポートを追加

import type { Preview } from '@storybook/nextjs-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

// 以下は既存のコード...
```

### MSWハンドラーのデバッグ

MSWが正しく動作しているか確認するには、ブラウザの開発者ツールのコンソールで以下を確認：

1. `[MSW] Mocking enabled.`というメッセージが表示されているか
2. APIリクエストがインターセプトされているか（`[MSW] 200 GET /api/users`のようなログ）

## 🚀 トラブルシューティング

### それでもエラーが解決しない場合

1. **キャッシュのクリア**
   ```bash
   rm -rf node_modules/.cache
   rm -rf .next
   pnpm install
   ```

2. **Service Workerの登録確認**
   - ブラウザの開発者ツール > Application > Service Workers
   - `mockServiceWorker`が登録されているか確認

3. **MSWのバージョン確認**
   ```bash
   pnpm list msw msw-storybook-addon
   ```

4. **Storybookのログ確認**
   - ブラウザのコンソールでエラーメッセージを確認
   - ターミナルでStorybookの出力を確認

## 📚 参考リンク

- [MSW公式ドキュメント](https://mswjs.io/)
- [msw-storybook-addon](https://github.com/mswjs/msw-storybook-addon)
- [Storybook with MSW](https://storybook.js.org/addons/msw-storybook-addon)

## ✨ 修正後の動作

修正が完了すると、以下のような動作が確認できます：

1. **Default**: 正常にユーザーリストが表示される
2. **Loading**: ローディング中のスケルトンが表示される
3. **Error**: エラーメッセージが表示される
4. **EmptyList**: 空のリストが表示される
5. **ManyUsers**: 100人のユーザーが表示される

各ストーリーで異なるAPIレスポンスをシミュレートできるようになります。