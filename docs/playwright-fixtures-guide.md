# Playwright Fixturesの理解ガイド

## Fixturesとは？

Fixturesは「テストに必要な環境や道具を自動的に準備・片付けしてくれる仕組み」です。

```
┌─────────────────────────────────────┐
│         Playwrightテスト              │
├─────────────────────────────────────┤
│  テスト開始                           │
│    ↓                                │
│  Fixturesが自動的に準備               │
│    - ブラウザ起動                    │
│    - ページ作成                      │
│    - その他の環境設定                 │
│    ↓                                │
│  テストコード実行                     │
│    ↓                                │
│  Fixturesが自動的にクリーンアップ      │
│    - ページを閉じる                   │
│    - リソースを解放                   │
│    ↓                                │
│  テスト終了                           │
└─────────────────────────────────────┘
```

## 主なビルトインFixtures一覧

| Fixture | 型 | 説明 | 使用例 |
|---------|-----|------|--------|
| page | Page | 個別のブラウザページ | `await page.goto('/')` |
| context | BrowserContext | ブラウザコンテキスト（複数ページを管理） | `await context.newPage()` |
| browser | Browser | ブラウザインスタンス | `await browser.newContext()` |
| browserName | string | 実行中のブラウザ名 | `if (browserName === 'chromium')` |
| request | APIRequestContext | APIリクエスト用 | `await request.get('/api')` |

## Fixturesの階層関係

```
browser（ブラウザ全体）
  └── context（コンテキスト = シークレットウィンドウのようなもの）
        └── page（個別のタブ/ページ）
```

## よくある使用パターン

### 1. 単純なページテスト
```typescript
test('基本テスト', async ({ page }) => {
  await page.goto('/');
  // pageだけで十分
});
```

### 2. 複数タブが必要な場合
```typescript
test('複数タブ', async ({ context, page }) => {
  // メインページ
  await page.goto('/');
  
  // 新しいタブ
  const newPage = await context.newPage();
  await newPage.goto('/help');
});
```

### 3. ブラウザごとの処理
```typescript
test('ブラウザ別処理', async ({ page, browserName }) => {
  if (browserName === 'webkit') {
    // Safari特有の処理
  }
  await page.goto('/');
});
```

### 4. APIとUIの連携
```typescript
test('API連携', async ({ page, request }) => {
  // APIでデータ作成
  const response = await request.post('/api/data');
  
  // UIで確認
  await page.goto('/');
  await page.reload(); // データを反映
});
```

## Fixturesの利点

1. **自動管理**: セットアップとクリーンアップを自動化
2. **独立性**: 各テストが独立した環境で実行
3. **再利用性**: 同じ設定を複数のテストで使い回せる
4. **型安全**: TypeScriptの型サポート

## デバッグのヒント

```typescript
test('デバッグ', async ({ page, browserName }) => {
  console.log(`実行環境: ${browserName}`);
  console.log(`ページURL: ${page.url()}`);
  
  // スクリーンショットを撮る
  await page.screenshot({ path: `debug-${browserName}.png` });
});
```

## 注意点

- Fixturesは各テストごとに新しく作成される
- テスト間でデータは共有されない
- 手動でFixtureを作成した場合は、手動でクリーンアップが必要

## まとめ

Fixturesを使うことで：
- ✅ ボイラープレートコードを削減
- ✅ テストの信頼性向上
- ✅ メンテナンスが容易
- ✅ 実行速度の最適化（リソースの効率的な利用）
