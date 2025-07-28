import { test, expect } from '@playwright/test';

// https://playwright.dev/docs/writing-tests
// https://playwright.dev/docs/locators
//playwright.dev/docs/api/class-locatorassertions

/**
 * Playwrightのロケーター戦略について
 *
 * 【CSSセレクター vs roleロケーター】
 *
 * ❌ 非推奨: CSSセレクター
 * - page.locator('h1')
 * - page.locator('.button-primary')
 * - DOM構造やクラス名に依存し、変更に脆弱
 *
 * ✅ 推奨: roleロケーター
 * - page.getByRole('heading', { level: 1 })
 * - page.getByRole('button', { name: '送信' })
 * - 要素の意味的な役割に基づき、構造変更に強い
 *
 * 【roleロケーターのメリット】
 * 1. 保守性: HTMLが変更されても動作し続ける
 *    例: クラス名が変わってもボタンの役割は変わらない
 *
 * 2. アクセシビリティ: スクリーンリーダーが認識できる要素を保証
 *
 * 3. 可読性: テストの意図が明確
 *    悪い例: page.locator('#nav > ul > li:nth-child(3) > a')
 *    良い例: page.getByRole('link', { name: 'お問い合わせ' })
 *
 * 【主なHTML要素の暗黙的role】
 * - <button> → role="button"
 * - <a href> → role="link"
 * - <h1> → role="heading" (level 1)
 * - <input type="text"> → role="textbox"
 * - <input type="checkbox"> → role="checkbox"
 */

test.describe('ホームページ', () => {
  test('タイトルとリンクが表示される', async ({ page }) => {
    // ホームページに移動
    await page.goto('/');

    // h1タグでHomeというテキストが表示されていることを確認
    //
    // 【改善前のコード】
    // await expect(page.locator('h1')).toContainText('Home');
    //
    // 【問題点】
    // - CSSセレクターを使用しているため、DOM構造の変更に脆弱
    // - 例: h1がh2に変更されたり、divにクラスを付けてスタイリングした場合に壊れる
    //
    // 【改善後のコード】
    // roleロケーターを使用し、要素の意味的な役割で特定
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Home');

    // Aboutリンクが表示されていることを確認
    //
    // 【良い実装例】
    // - getByRoleを使用して'link'ロールを持つ要素を特定
    // - nameオプションでリンクテキストを指定
    // - この方法なら、<a>タグのクラス名やDOM構造が変わっても動作する
    const aboutLink = page.getByRole('link', { name: 'About' });
    await expect(aboutLink).toBeVisible();
  });

  test('Aboutリンクをクリックできる', async ({ page }) => {
    await page.goto('/');

    // Aboutリンクをクリック
    //
    // 【ポイント】
    // - 同じroleロケーターを再利用してクリックアクションを実行
    // - CSSセレクターではなく、ユーザーが認識するテキストで要素を特定
    // - 仮にリンクが<button>タグに変更されても、roleを適切に変えるだけで対応可能
    await page.getByRole('link', { name: 'About' }).click();

    // URLが/aboutに変わることを確認
    await expect(page).toHaveURL('/about');
  });
});
