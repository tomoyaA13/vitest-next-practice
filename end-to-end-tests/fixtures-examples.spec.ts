import { test, expect } from '@playwright/test';

// 実際のアプリケーションに存在する要素のみを使ったテスト
test.describe('Fixturesの実践例（実際に動作する例）', () => {
  test('実際のホームページテスト', async ({ page }) => {
    await page.goto('/');
    
    // 実際に存在する要素を確認
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('実際のナビゲーションテスト', async ({ page }) => {
    await page.goto('/');
    
    // Aboutページへ移動
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
    
    // ホームに戻る
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('複数タブで実際のページを開く', async ({ context }) => {
    // 2つのタブで異なるページを開く
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    await page1.goto('/');
    await page2.goto('/about');
    
    // それぞれのページで確認
    await expect(page1.getByRole('heading', { level: 1 })).toContainText('Home');
    await expect(page2.getByRole('heading', { level: 1 })).toContainText('About');
  });

  test('ブラウザごとの動作確認', async ({ page, browserName }) => {
    await page.goto('/');
    
    console.log(`${browserName}でテスト実行中`);
    
    // ブラウザに関係なく動作する基本的なテスト
    const heading = await page.getByRole('heading', { level: 1 }).textContent();
    expect(heading).toBe('Home');
  });
});

// 以下は実際のアプリケーションに機能が実装されたら有効化してください
test.describe.skip('将来実装予定の機能のテスト例', () => {
  test('ログインテスト（実装後に有効化）', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('APIテスト（実装後に有効化）', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: 'テストユーザー',
        email: 'new@example.com'
      }
    });
    expect(response.status()).toBe(201);
  });
});
