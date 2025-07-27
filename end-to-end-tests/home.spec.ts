import { test, expect } from '@playwright/test';

// https://playwright.dev/docs/writing-tests
test.describe('ホームページ', () => {
  test('タイトルとリンクが表示される', async ({ page }) => {
    // ホームページに移動
    await page.goto('/');

    // h1タグでHomeというテキストが表示されていることを確認
    // Playwrightドキュメントの推奨に従い、CSSセレクターではなくroleロケーターを使用
    // roleロケーターはアクセシビリティ属性に基づいており、より堅牢なテストになります
    // h1要素は暗黙的に'heading'ロールを持ち、level: 1で特定できます
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');

    // Aboutリンクが表示されていることを確認
    const aboutLink = page.getByRole('link', { name: 'About' });
    await expect(aboutLink).toBeVisible();
  });

  test('Aboutリンクをクリックできる', async ({ page }) => {
    await page.goto('/');

    // Aboutリンクをクリック
    await page.getByRole('link', { name: 'About' }).click();

    // URLが/aboutに変わることを確認
    await expect(page).toHaveURL('/about');
  });
});
