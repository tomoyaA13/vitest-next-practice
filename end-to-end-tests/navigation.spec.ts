import { test, expect } from '@playwright/test';

/**
 * このファイルではroleロケーターを使用しています
 * 
 * リファクタリングの要点:
 * - page.locator('h1') → page.getByRole('heading', { level: 1 })
 * - page.locator('p') → page.getByText('テキスト内容')
 * 
 * これにより、DOM構造の変更に強いテストになりました
 */

test.describe('ナビゲーションテスト', () => {
  test('ホームページとAboutページ間のナビゲーション', async ({ page }) => {
    // ホームページに移動
    await page.goto('/');

    // ホームページの内容を確認
    await expect(page).toHaveTitle(/vitest-next-practice/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');

    // Aboutページへ移動
    await page.getByRole('link', { name: 'About' }).click();
    
    // Aboutページに遷移したことを確認
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
    await expect(page.getByText('これはAboutページです。')).toBeVisible();

    // ホームページに戻る
    await page.getByRole('link', { name: 'Home' }).click();
    
    // ホームページに戻ったことを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');
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
