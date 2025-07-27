import { test, expect } from '@playwright/test';

test.describe('Fixturesの基本を理解する', () => {
  // 最もシンプルな例
  test('pageフィクスチャーだけを使う', async ({ page }) => {
    // pageは自動的に用意される
    await page.goto('/');
    
    // ページのタイトルを確認
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // h1要素の確認
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');
    
    // このテストが終わると、pageは自動的に閉じられる
  });

  // 複数のフィクスチャーを使う例
  test('複数のフィクスチャーを同時に使う', async ({ page, browserName }) => {
    console.log(`このテストは ${browserName} で実行されています`);
    
    await page.goto('/');
    
    // ブラウザによって異なる動作をさせることができる
    if (browserName === 'chromium') {
      console.log('Chromeでの特別な処理');
    }
    
    // 共通の確認
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  // contextを使って複数のページを扱う例
  test('複数のページを同時に操作', async ({ context }) => {
    // 2つのページを作成
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // それぞれ別のURLにアクセス
    await page1.goto('/');
    await page2.goto('/about');
    
    // それぞれのページで確認
    await expect(page1.getByRole('heading', { level: 1 })).toContainText('Home');
    await expect(page2.getByRole('heading', { level: 1 })).toContainText('About');
    
    // 両方のページは自動的に閉じられる
  });

  // requestフィクスチャーでHTMLレスポンスをテストする例
  test('ページのHTMLレスポンスをテスト', async ({ request }) => {
    // 実際のページにリクエスト
    const response = await request.get('/');
    
    // ステータスコードを確認
    expect(response.status()).toBe(200);
    
    // レスポンスボディを確認
    const html = await response.text();
    expect(html).toContain('<h1>Home</h1>');
  });

  // すべてを組み合わせた実践的な例
  test('実践的な例：複数ページのナビゲーション', async ({ page, context }) => {
    // メインページ
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');
    
    // 新しいタブでAboutページを開く
    const aboutPage = await context.newPage();
    await aboutPage.goto('/about');
    
    // 両方のページで動作確認
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');
    await expect(aboutPage.getByRole('heading', { level: 1 })).toContainText('About');
    
    // メインページからAboutへ移動
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
  });
});

// Fixturesのライフサイクルを理解する例
test.describe('Fixturesのライフサイクル', () => {
  test.beforeEach(async ({ page }) => {
    console.log('beforeEach: 新しいpageが作成されました');
    console.log('URL:', page.url()); // about:blank
  });

  test('テスト1', async ({ page }) => {
    await page.goto('/');
    console.log('テスト1実行中');
  });

  test('テスト2', async ({ page }) => {
    await page.goto('/about');
    console.log('テスト2実行中（テスト1とは別のpage）');
  });

  test.afterEach(async ({ page }) => {
    console.log('afterEach: pageが閉じられる前');
    console.log('最終URL:', page.url());
  });
});
