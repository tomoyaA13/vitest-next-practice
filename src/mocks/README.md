# MSWハンドラーパターンへの移行完了

## 📁 新しいディレクトリ構造

```
src/
├── components/
│   ├── UserList.tsx
│   └── __tests__/
│       └── UserList.test.tsx    # ハンドラーパターンに移行済み
├── mocks/                       # MSWモック集中管理（新規追加）
│   ├── handlers.ts             # APIハンドラー定義
│   ├── server.ts              # テスト用サーバー設定
│   └── browser.ts             # 開発用ワーカー設定（オプション）
└── ...

vitest.setup.ts                  # MSWグローバルセットアップを追加
```

## 🔄 主な変更点

### 1. **handlers.ts** - モックハンドラーの集中管理
- 基本ハンドラー（成功レスポンス）
- エラーハンドラー（各種エラーパターン）
- 特殊ケース用ハンドラー（遅延、空レスポンスなど）
- ユーティリティ関数（カスタムハンドラー作成）

### 2. **server.ts** - テスト環境用サーバー
- `setupServer`でサーバーインスタンスを作成
- 基本ハンドラーで初期化

### 3. **vitest.setup.ts** - グローバルセットアップ
```typescript
// MSWサーバーの自動起動・停止
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 4. **UserList.test.tsx** - テストファイルの簡潔化
- サーバーのセットアップ/クリーンアップ処理が不要
- ハンドラーをインポートして使用
- `server.use()`で特定のテスト用にハンドラーを上書き

## 🎯 使用方法

### テストでの使用

```typescript
// デフォルトハンドラーを使用
it('通常のテスト', async () => {
  render(<UserList />);
  // デフォルトのモックが自動的に使用される
});

// 特定のハンドラーを使用
it('エラーケースのテスト', async () => {
  server.use(errorHandlers.serverError);
  render(<UserList />);
  // 500エラーが返される
});

// カスタムハンドラーを使用
it('カスタムレスポンスのテスト', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json([/* カスタムデータ */]);
    })
  );
  render(<UserList />);
});
```

### 開発環境での使用（オプション）

```typescript
// main.tsx または index.tsx
import { enableMocking } from './mocks/browser';

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

## ✅ メリット

1. **コードの整理** - モックが一箇所に集約
2. **再利用性** - 同じモックを複数箇所で使用可能
3. **保守性** - API変更時の修正が容易
4. **拡張性** - 新しいハンドラーの追加が簡単
5. **チーム開発** - モックの仕様が明確

## 🚀 次のステップ

1. **MSWのインストール**（まだの場合）
   ```bash
   npm install --save-dev msw
   ```

2. **開発環境でのMSW使用**（オプション）
   ```bash
   npx msw init public/ --save
   ```

3. **他のコンポーネントのテストも移行**
   - 同じパターンを適用
   - 共通のハンドラーを再利用

## 📝 注意事項

- `global.fetch = vi.fn()`によるモックは削除されました
- グローバルセットアップにより、各テストファイルでのセットアップは不要
- ハンドラーは各テスト後に自動的にリセットされます
