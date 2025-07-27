# Playwright E2E テスト実装ガイド

## 現在の状況

### ✅ 動作するテスト
- ナビゲーションテスト（Home ↔ About）
- 複数タブのテスト
- Fixturesの基本的な使用例
- カスタムFixturesの例（aboutPage）

### ⚠️ スキップされているテスト
- ログイン機能のテスト（未実装）
- API連携テスト（エンドポイント未実装）
- フォーム操作のテスト（フォーム未実装）

## テストの実行方法

```bash
# すべてのE2Eテストを実行
pnpm test:e2e

# 特定のファイルのみ実行（実際に動作するもの）
pnpm playwright test navigation.spec.ts
pnpm playwright test fixtures-basic-examples.spec.ts

# UIモードで確認
pnpm test:e2e:ui
```

## 新機能実装時のE2Eテスト追加手順

### 1. フォーム機能を追加する場合

```typescript
// end-to-end-tests/forms.spec.ts
test('お問い合わせフォーム', async ({ page }) => {
  await page.goto('/contact');
  
  // フォーム入力
  await page.fill('input[name="name"]', 'テスト太郎');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="message"]', 'テストメッセージ');
  
  // 送信
  await page.click('button[type="submit"]');
  
  // 成功メッセージ確認
  await expect(page.locator('.success-message')).toContainText('送信完了');
});
```

### 2. 認証機能を追加する場合

```typescript
// end-to-end-tests/auth.spec.ts
test.describe('認証機能', () => {
  test('ログイン', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードへリダイレクト
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('ログアウト', async ({ page }) => {
    // ログイン状態を作る
    await page.goto('/login');
    // ... ログイン処理
    
    // ログアウト
    await page.click('button#logout');
    await expect(page).toHaveURL('/');
  });
});
```

### 3. API機能を追加する場合

```typescript
// end-to-end-tests/api.spec.ts
test('APIとUIの連携', async ({ page, request }) => {
  // APIでデータ作成
  const response = await request.post('/api/items', {
    data: { name: 'テストアイテム' }
  });
  expect(response.ok()).toBeTruthy();
  
  // UIで確認
  await page.goto('/items');
  await expect(page.locator('text=テストアイテム')).toBeVisible();
});
```

## ベストプラクティス

### 1. セレクタの選び方

```typescript
// 👍 良い例（推奨順）
await page.getByRole('button', { name: '送信' });
await page.getByLabel('メールアドレス');
await page.getByTestId('submit-button');

// 👎 避けるべき例
await page.locator('.btn-primary'); // クラス名は変更されやすい
await page.locator('#submit'); // IDも変更される可能性
```

### 2. 待機処理

```typescript
// 👍 良い例
await expect(page.locator('.loading')).toBeHidden();
await page.waitForLoadState('networkidle');

// 👎 避けるべき例
await page.waitForTimeout(3000); // 固定時間の待機
```

### 3. データ属性の活用

```typescript
// コンポーネント側
<button data-testid="submit-form">送信</button>

// テスト側
await page.getByTestId('submit-form').click();
```

## トラブルシューティング

### テストがタイムアウトする場合

1. 要素が存在することを確認
```bash
pnpm test:e2e:ui  # UIモードで視覚的に確認
```

2. セレクタを確認
```typescript
// デバッグ用
const element = page.locator('button');
await element.waitFor({ state: 'visible' });
console.log(await element.count()); // 要素数を確認
```

3. タイムアウト時間を調整
```typescript
test('長い処理', async ({ page }) => {
  test.setTimeout(60000); // 60秒に設定
  // ...
});
```

## 次のステップ

1. コンポーネントにdata-testid属性を追加
2. ページオブジェクトモデルの導入を検討
3. CI/CDでのE2Eテスト実行を設定
4. Visual Regression Testing の追加を検討

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
