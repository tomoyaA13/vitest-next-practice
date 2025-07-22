# Storybookガイド - 使い方と基本概念

## 📘 Storybookとは？

Storybookは、UIコンポーネントを独立した環境で開発・テストするためのツールです。以下のような利点があります：

- **コンポーネントの独立開発**: アプリケーション全体を起動せずに、個別のコンポーネントを開発できる
- **視覚的なテスト**: 様々な状態のコンポーネントを一覧で確認できる
- **ドキュメント化**: コンポーネントの使い方を自動的にドキュメント化
- **共有とコラボレーション**: チームメンバーやデザイナーとUIの確認が容易

## 🚀 Storybookの起動方法

```bash
# Storybookを起動
npm run storybook
# または
pnpm storybook

# ビルド（静的サイトとして出力）
npm run build-storybook
```

起動後、ブラウザで `http://localhost:6006` にアクセスします。

## 📁 ファイル構造

```
src/
├── components/
│   ├── Button.tsx              # コンポーネント本体
│   └── __stories__/           # ストーリーファイルを格納
│       └── Button.stories.tsx  # Buttonのストーリー
```

## 🔧 ストーリーファイルの基本構造

### 1. メタデータの定義

```typescript
const meta = {
  title: 'Components/Button',     // サイドバーでの表示場所
  component: Button,              // 対象コンポーネント
  parameters: {
    layout: 'centered',          // レイアウト設定
  },
  tags: ['autodocs'],            // 自動ドキュメント生成
  argTypes: {                    // プロパティの制御設定
    variant: {
      control: 'radio',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
```

### 2. ストーリーの定義

```typescript
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'ボタン',
    variant: 'primary',
  },
};
```

## 🎯 主要な機能

### 1. **Controls（コントロール）**
- Storybookの画面下部でプロパティを動的に変更できる
- `argTypes`で各プロパティのコントロール方法を設定

### 2. **Actions（アクション）**
- イベントハンドラーの呼び出しをログに記録
- `onClick`などのイベントをデバッグ

### 3. **Docs（ドキュメント）**
- `tags: ['autodocs']`で自動生成
- コンポーネントの使用方法を文書化

### 4. **Viewport（ビューポート）**
- 異なる画面サイズでの表示を確認
- レスポンシブデザインのテスト

## 🔍 高度な使い方

### 1. **MSW（Mock Service Worker）との連携**

```typescript
parameters: {
  msw: {
    handlers: [
      http.get('/api/users', () => {
        return HttpResponse.json(mockData);
      }),
    ],
  },
}
```

APIリクエストをモックして、非同期処理のテストが可能。

### 2. **Play関数**

```typescript
play: async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  
  await step('ボタンをクリック', async () => {
    await userEvent.click(canvas.getByRole('button'));
  });
}
```

ユーザー操作を自動化してテスト。

### 3. **デコレーター**

```typescript
decorators: [
  (Story) => (
    <div style={{ padding: '20px' }}>
      <Story />
    </div>
  ),
]
```

ストーリーにラッパー要素を追加。

## 💡 ベストプラクティス

### 1. **命名規則**
- ストーリーファイル: `ComponentName.stories.tsx`
- ストーリー名: わかりやすい状態を表す名前（`Default`, `Loading`, `Error`など）

### 2. **ストーリーの粒度**
- 1つのストーリー = 1つの状態
- すべての重要な状態をカバー
- エッジケースも含める

### 3. **ドキュメント**
- 各ストーリーに説明を追加
- 使用例を含める
- プロパティの説明を詳細に

### 4. **テスト**
- Play関数で操作をテスト
- アクセシビリティのチェック
- 視覚的な回帰テスト

## 🛠️ トラブルシューティング

### よくある問題

1. **コンポーネントが表示されない**
   - インポートパスを確認
   - exportが正しいか確認

2. **MSWが動作しない**
   - public/mockServiceWorker.jsが存在するか確認
   - ブラウザのコンソールでエラーを確認

3. **スタイルが適用されない**
   - グローバルCSS/Tailwindの設定を確認
   - .storybook/preview.jsの設定を確認

## 📚 参考リンク

- [Storybook公式ドキュメント](https://storybook.js.org/docs)
- [MSWドキュメント](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)

## 🎉 次のステップ

1. 既存のコンポーネントにストーリーを追加
2. Play関数でインタラクティブなテストを作成
3. CI/CDパイプラインにStorybookのビルドを追加
4. Chromatic等のビジュアルテストツールと連携

このガイドを参考に、Storybookを活用してより良いコンポーネント開発を行ってください！