import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // テストファイルが格納されているディレクトリ
  testDir: './end-to-end-tests',
  
  // テストファイル内のテストを並列実行するかどうか
  // trueの場合、各テストファイル内のテストが並列に実行される
  fullyParallel: true,
  
  // CI環境でtest.onlyが残っていた場合にビルドを失敗させる
  // 本番環境に特定のテストのみ実行するコードが残るのを防ぐ
  forbidOnly: !!process.env.CI,
  
  // テスト失敗時のリトライ回数
  // CI環境では2回まで再試行、ローカルでは再試行なし
  retries: process.env.CI ? 2 : 0,
  
  // 並列実行するワーカー数
  // CI環境では1つ（安定性重視）、ローカルでは自動設定
  workers: process.env.CI ? 1 : undefined,
  
  // テスト結果のレポート形式
  // 'html'レポートは視覚的にテスト結果を確認できる
  reporter: 'html',
  
  /* すべてのプロジェクトで共有される設定 */
  use: {
    /* page.goto('/')のような相対パスで使用されるベースURL */
    baseURL: 'http://localhost:3000',

    /* 失敗したテストを再実行する際にトレースを収集 */
    // トレースはテストの実行過程を記録し、デバッグに役立つ
    trace: 'on-first-retry',
  },

  /* 各ブラウザでのテスト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* モバイルデバイスでのテスト設定（コメントアウト中） */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* 特定のブラウザチャンネルでのテスト（コメントアウト中） */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* テスト実行前に開発サーバーを自動起動する設定 */
  webServer: {
    // 開発サーバーを起動するコマンド
    command: 'pnpm run dev',
    
    // サーバーが起動したことを確認するURL
    url: 'http://localhost:3000',
    
    // 既存のサーバーがある場合は再利用する
    // CI環境では常に新しくサーバーを起動
    reuseExistingServer: !process.env.CI,
    
    // サーバー起動のタイムアウト時間（ミリ秒）
    // 2分間待機してもサーバーが起動しない場合はエラー
    timeout: 120 * 1000,
  },
});
