import { test as base, Page, expect } from '@playwright/test';

// ========================================
// カスタムFixturesの型定義
// ========================================
// TypeScriptの型定義により、どんなfixtureが利用可能かを明確にする
type MyFixtures = {
  // aboutPage: すでに'/about'ページに移動済みのPageオブジェクト
  aboutPage: Page;

  // testConfig: テスト全体で共有する設定オブジェクト
  testConfig: {
    baseUrl: string;
    defaultTimeout: number;
  };
};

// ========================================
// カスタムFixturesを拡張したtestオブジェクトの作成
// ========================================
// base.extend()を使って、Playwrightの標準testに独自のfixtureを追加
export const test = base.extend<MyFixtures>({
  // ----------------------------------------
  // Fixture 1: testConfig
  // ----------------------------------------
  // 目的: テスト設定を一元管理し、全テストで同じ設定を使用
  testConfig: async ({}, use) => {
    // {} は空のオブジェクト（このfixtureは他のfixtureに依存しない）

    // セットアップ: 設定オブジェクトを作成
    const config = {
      baseUrl: 'http://localhost:3000',
      defaultTimeout: 5000,
    };

    // await use() の引数には、そのfixtureがテストに提供したい値を渡します。
    // use()の前がセットアップ、後がティアダウン
    await use(config);

    // ティアダウン: このfixtureでは特に不要
  },

  // ----------------------------------------
  // Fixture 2: aboutPage
  // ----------------------------------------
  // 目的: Aboutページに移動済みの状態でテストを開始できる
  aboutPage: async ({ page }, use) => {
    // { page } は標準のpage fixtureに依存することを示す

    // === セットアップフェーズ ===
    // 1. Aboutページへ移動
    await page.goto('/about');

    // 2. ページが正しく読み込まれたことを確認
    // （h1タグに"About"が含まれているか）
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About');

    // === テスト実行フェーズ ===
    // 準備済みのページをテストに提供
    await use(page);

    // === ティアダウンフェーズ ===
    // このfixtureでは特別な後片付けは不要
    // （pageオブジェクト自体はPlaywrightが自動的にクリーンアップ）
  },
});

// ========================================
// 実際のテストケース
// ========================================

// ----------------------------------------
// テスト1: シンプルなカスタムFixtureの使用例
// ----------------------------------------
test('Aboutページのカスタムフィクスチャー', async ({ aboutPage }) => {
  // aboutPageはすでに'/about'に移動済み！
  // fixtureのおかげで、毎回page.goto('/about')を書く必要がない

  // h1タグのテキストを取得して確認
  const heading = await aboutPage.getByRole('heading', { level: 1 }).textContent();
  expect(heading).toBe('About');

  // ホームページへのリンクが存在することを確認
  await expect(aboutPage.getByRole('link', { name: 'Home' })).toBeVisible();
});

// ----------------------------------------
// テスト2: 複数のFixtureを組み合わせた使用例
// ----------------------------------------
test('複数のカスタムFixtures使用', async ({ aboutPage, testConfig, browserName }) => {
  // 3つのfixtureを同時に使用:
  // - aboutPage: カスタムFixture（Aboutページに移動済み）
  // - testConfig: カスタムFixture（設定オブジェクト）
  // - browserName: Playwright標準Fixture（実行中のブラウザ名）

  // デバッグ用に設定とブラウザ情報を出力
  console.log(`設定: ${JSON.stringify(testConfig)}`);
  console.log(`ブラウザ: ${browserName}`);

  // aboutPageがAboutページにいることを確認
  const url = aboutPage.url();
  expect(url).toContain('/about');

  // ナビゲーションテスト: ホームに戻る
  await aboutPage.getByRole('link', { name: 'Home' }).click();

  // testConfigのbaseUrlを使って正しいURLに遷移したか確認
  await expect(aboutPage).toHaveURL(testConfig.baseUrl + '/');
});

// ========================================
// 高度な使用例: 認証済みページのFixture
// ========================================
// describe.skipで現在は実行されないが、将来の実装例として残している
test.describe.skip('ログイン機能実装後のカスタムFixture例', () => {
  // ログイン済みページ専用のtest関数を作成
  const authenticatedTest = base.extend<{ authenticatedPage: Page }>({
    authenticatedPage: async ({ page }, use) => {
      // === セットアップ: ログイン処理 ===
      await page.goto('/login');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();

      // ログイン後、ダッシュボードに遷移するまで待機
      await page.waitForURL('/dashboard');

      // === テスト実行 ===
      // ログイン済みのページを提供
      await use(page);

      // === ティアダウン: ログアウト処理 ===
      // テスト後は必ずログアウトして、次のテストに影響しないようにする
      await page.goto('/logout');
    },
  });

  // ログイン済み状態でのテスト
  authenticatedTest('ログイン済みテスト', async ({ authenticatedPage }) => {
    // すでにログイン済みなので、認証が必要なページに直接アクセス可能
    await authenticatedPage.goto('/profile');
    // プロフィールページのテストを実行...
  });
});

// ========================================
// Fixtureを使うメリット（まとめ）
// ========================================
// 1. DRY原則: 同じセットアップコードを繰り返し書かない
// 2. 保守性: セットアップロジックが一箇所に集約される
// 3. 可読性: テストが本質的な部分に集中できる
// 4. 信頼性: 必ずクリーンアップが実行される
// 5. 型安全性: TypeScriptによる補完とエラーチェック
