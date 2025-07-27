# Playwright E2Eテストガイド

## 概要
このプロジェクトでは、PlaywrightをE2E（エンドツーエンド）テストフレームワークとして使用しています。

## セットアップ
```bash
# Playwrightとブラウザのインストール
pnpm create playwright

# ブラウザのみインストール（既にPlaywrightがインストール済みの場合）
pnpm exec playwright install
```

## テストの実行

### 基本的なコマンド
```bash
# すべてのE2Eテストを実行（ヘッドレスモード）
pnpm test:e2e

# UIモードで実行（視覚的にテストの流れを確認できる）
pnpm test:e2e:ui

# デバッグモードで実行（ステップごとに確認できる）
pnpm test:e2e:debug
```

### 詳細なオプション
```bash
# 特定のテストファイルのみ実行
pnpm playwright test navigation.spec.ts

# 特定のブラウザでのみ実行
pnpm playwright test --project=chromium  # Chromiumのみ
pnpm playwright test --project=firefox   # Firefoxのみ
pnpm playwright test --project=webkit    # Safari/WebKitのみ

# ヘッドフルモードで実行（ブラウザウィンドウを表示）
pnpm playwright test --headed

# 特定のテストのみ実行
pnpm playwright test -g "ホームページ"

# テストレポートを開く
pnpm playwright show-report
```

## テストの書き方

### 基本構造
```typescript
import { test, expect } from '@playwright/test';

test.describe('機能名', () => {
  test('テストケース名', async ({ page }) => {
    // ページに移動
    await page.goto('/');
    
    // 要素の検証
    await expect(page.locator('h1')).toContainText('期待するテキスト');
    
    // アクションの実行
    await page.click('button');
    
    // 結果の検証
    await expect(page).toHaveURL('/expected-url');
  });
});
```

### よく使うセレクタ
```typescript
// テキストで要素を探す
await page.getByText('テキスト').click();

// ロールで要素を探す
await page.getByRole('button', { name: 'ボタン名' }).click();
await page.getByRole('link', { name: 'リンク名' }).click();

// データ属性で要素を探す
await page.getByTestId('test-id').click();

// CSSセレクタで要素を探す
await page.locator('h1').click();
await page.locator('.class-name').click();
await page.locator('#id').click();
```

### よく使うアサーション
```typescript
// ページのタイトルを検証
await expect(page).toHaveTitle('期待するタイトル');

// URLを検証
await expect(page).toHaveURL('/expected-url');

// 要素のテキストを検証
await expect(page.locator('h1')).toContainText('期待するテキスト');

// 要素が表示されているか検証
await expect(page.locator('button')).toBeVisible();

// 要素が存在するか検証
await expect(page.locator('button')).toHaveCount(1);
```

## デバッグ方法

### スクリーンショット
```typescript
// テスト中にスクリーンショットを撮る
await page.screenshot({ path: 'screenshot.png' });
```

### ブレークポイント
```typescript
// デバッグモードで一時停止
await page.pause();
```

### コンソールログ
```typescript
// ページのコンソールログを出力
page.on('console', msg => console.log(msg.text()));
```

## CI/CD設定
GitHub Actionsワークフローは`.github/workflows/playwright.yml`に設定されています。
プッシュ時に自動的にテストが実行されます。

## トラブルシューティング

### ポート3000が使用中の場合
```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### ブラウザがインストールされていない場合
```bash
pnpm exec playwright install
```

### タイムアウトエラーが発生する場合
`playwright.config.ts`でタイムアウト時間を調整：
```typescript
use: {
  // アクションのタイムアウト
  actionTimeout: 10000,
  // ナビゲーションのタイムアウト
  navigationTimeout: 30000,
}
```
