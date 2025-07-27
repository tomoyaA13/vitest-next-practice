import { test as base, Page, expect } from '@playwright/test';

// カスタムFixturesの型定義
type MyFixtures = {
  // 特定のページに移動済みのページ
  aboutPage: Page;
  // テスト用の設定
  testConfig: {
    baseUrl: string;
    defaultTimeout: number;
  };
};

// カスタムFixturesを含むtestを作成
export const test = base.extend<MyFixtures>({
  // テスト設定のFixture
  testConfig: async ({}, use) => {
    const config = {
      baseUrl: 'http://localhost:3000',
      defaultTimeout: 5000
    };
    await use(config);
  },
  
  // Aboutページに移動済みのFixture
  aboutPage: async ({ page }, use) => {
    // Aboutページに移動
    await page.goto('/about');
    
    // ページが読み込まれたことを確認
    await expect(page.locator('h1')).toContainText('About');
    
    // 設定済みのページを提供
    await use(page);
  },
});

// カスタムFixturesを使った実際に動作するテスト
test('Aboutページのカスタムフィクスチャー', async ({ aboutPage }) => {
  // すでにAboutページに移動済み
  const heading = await aboutPage.locator('h1').textContent();
  expect(heading).toBe('About');
  
  // ホームページへのリンクが存在することを確認
  await expect(aboutPage.getByRole('link', { name: 'Home' })).toBeVisible();
});

test('複数のカスタムFixtures使用', async ({ aboutPage, testConfig, browserName }) => {
  console.log(`設定: ${JSON.stringify(testConfig)}`);
  console.log(`ブラウザ: ${browserName}`);
  
  // aboutPageはすでにAboutページ
  const url = aboutPage.url();
  expect(url).toContain('/about');
  
  // ホームに戻る
  await aboutPage.getByRole('link', { name: 'Home' }).click();
  await expect(aboutPage).toHaveURL(testConfig.baseUrl + '/');
});

// 実装後に有効化するためのテンプレート
test.describe.skip('ログイン機能実装後のカスタムFixture例', () => {
  // ログイン済みページのFixture（実装例）
  const authenticatedTest = base.extend<{ authenticatedPage: Page }>({
    authenticatedPage: async ({ page }, use) => {
      // ログイン処理
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // ログイン済みのページを提供
      await use(page);
      
      // クリーンアップ
      await page.goto('/logout');
    },
  });

  authenticatedTest('ログイン済みテスト', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile');
    // プロフィールページのテスト
  });
});
