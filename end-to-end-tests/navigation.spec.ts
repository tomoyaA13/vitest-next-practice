import { test, expect } from '@playwright/test';

test.describe('ナビゲーションテスト', () => {
  test('ホームページとAboutページ間のナビゲーション', async ({ page }) => {
    // ホームページに移動
    await page.goto('/');

    // ホームページの内容を確認
    await expect(page).toHaveTitle(/vitest-next-practice/);
    await expect(page.locator('h1')).toContainText('Home');

    // Aboutページへ移動
    await page.getByRole('link', { name: 'About' }).click();
    
    // Aboutページに遷移したことを確認
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About');
    await expect(page.locator('p')).toContainText('これはAboutページです。');

    // ホームページに戻る
    await page.getByRole('link', { name: 'Home' }).click();
    
    // ホームページに戻ったことを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Home');
  });
});

test.describe('レスポンシブテスト', () => {
  test('モバイルビューでナビゲーションが動作する', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    
    // モバイルでもリンクがクリックできることを確認
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
  });
});
