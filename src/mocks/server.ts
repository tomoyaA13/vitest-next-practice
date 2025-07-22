/**
 * @file server.ts
 * @description Node.js環境（テスト環境）用のMSWサーバー設定
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { afterAll, afterEach, beforeAll } from 'vitest';

/**
 * テスト環境で使用するMSWサーバーインスタンス
 * 基本ハンドラーで初期化
 */
export const server = setupServer(...handlers);

/**
 * サーバーの設定オプション
 */
export const serverOptions = {
  // 未定義のリクエストはエラーとして扱う（テスト環境では厳密に）
  onUnhandledRequest: 'error' as const,
};

/**
 * テスト環境でのセットアップヘルパー
 * 各テストファイルで個別にセットアップする場合に使用
 */
export const setupTestServer = () => {
  beforeAll(() => server.listen(serverOptions));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};
