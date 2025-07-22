/**
 * @file vitest.setup.ts
 * @description Vitestのグローバルセットアップファイル
 * 全てのテストファイルの実行前に読み込まれ、共通の設定や初期化を行う
 */

// ========== Testing Library の拡張マッチャー ==========
/**
 * @testing-library/jest-domのインポート
 * DOMに関する便利なカスタムマッチャーを追加
 * 例：toBeInTheDocument(), toHaveClass(), toBeDisabled() など
 */
import '@testing-library/jest-dom';

// React Testing Libraryのクリーンアップ関数
import { cleanup } from '@testing-library/react';

// Vitestのフック関数とモックユーティリティ
import { afterEach, vi, beforeAll, afterAll } from 'vitest';

/**
 * 各テスト後のクリーンアップ処理
 * React Testing Libraryでレンダリングされたコンポーネントを
 * 自動的にアンマウントし、DOMをクリーンな状態に保つ
 */
afterEach(() => {
  // cleanup(): レンダリングされた全てのコンポーネントをアンマウント
  // これにより、テスト間でのDOM汚染を防ぐ
  cleanup();
});

// ========== グローバルなモック設定 ==========

/**
 * ResizeObserverのモック
 * 多くのUIライブラリ（Radix UI、Headless UIなど）が内部的に使用
 * ブラウザAPIなので、Node.js環境では存在しないためモック化が必要
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  // 要素の監視を開始
  observe: vi.fn(),
  // 要素の監視を停止
  unobserve: vi.fn(),
  // 全ての監視を停止
  disconnect: vi.fn(),
}));

/**
 * Next.js Routerのモック設定
 * テスト環境ではNext.jsのルーティング機能が使えないため、
 * 必要な関数をモック化して提供
 */
vi.mock('next/navigation', () => ({
  /**
   * useRouterフックのモック
   * ナビゲーション関連の関数を提供
   */
  useRouter() {
    return {
      // ページ遷移をシミュレート
      push: vi.fn(),
      // ページ置換をシミュレート
      replace: vi.fn(),
      // プリフェッチをシミュレート
      prefetch: vi.fn(),
      // 戻るボタンの動作をシミュレート
      back: vi.fn(),
    };
  },

  /**
   * useSearchParamsフックのモック
   * URLのクエリパラメータを扱うためのフック
   */
  useSearchParams() {
    // 空のURLSearchParamsオブジェクトを返す
    return new URLSearchParams();
  },

  /**
   * usePathnameフックのモック
   * 現在のパス名を取得するためのフック
   */
  usePathname() {
    // デフォルトで空文字列を返す
    return '';
  },
}));

/**
 * その他の一般的なグローバルモック（必要に応じて追加）
 */

// IntersectionObserverのモック（遅延読み込みやスクロール検知で使用）
// global.IntersectionObserver = vi.fn().mockImplementation(() => ({
//   observe: vi.fn(),
//   unobserve: vi.fn(),
//   disconnect: vi.fn(),
// }));

// matchMediaのモック（レスポンシブデザインのテストで使用）
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: vi.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: vi.fn(),
//     removeListener: vi.fn(),
//     addEventListener: vi.fn(),
//     removeEventListener: vi.fn(),
//     dispatchEvent: vi.fn(),
//   })),
// });

/**
 * このセットアップファイルの役割：
 *
 * 1. テスト環境の標準化
 *    - 全てのテストで共通の環境を提供
 *    - ブラウザAPIのモック化
 *
 * 2. DOMのクリーンアップ
 *    - 各テスト後に自動的にDOMをリセット
 *    - メモリリークの防止
 *
 * 3. カスタムマッチャーの追加
 *    - jest-domによる便利なアサーション
 *    - より読みやすいテストコード
 *
 * 4. フレームワーク固有の設定
 *    - Next.jsのルーティング機能のモック
 *    - SSR/SSG関連の処理のスキップ
 *
 * 5. パフォーマンスの最適化
 *    - 不要な処理のスキップ
 *    - テスト実行時間の短縮
 */

/**
 * 追加で検討すべき設定：
 *
 * - 環境変数の設定（process.env.NODE_ENV = 'test'）
 * - タイムゾーンの固定化
 * - 日付のモック（vi.setSystemTime）
 * - コンソール出力の制御
 * - エラーバウンダリの設定
 * - グローバルなエラーハンドリング
 * - カスタムレンダラーの定義
 * - テストユーティリティの追加
 */

// ========== MSW（Mock Service Worker）のセットアップ ==========
/**
 * MSWサーバーのグローバル設定
 * 全てのテストで共通のモックサーバーを使用
 */
import { server } from '@/mocks/server';

// MSWサーバーの起動（全テスト開始前）
beforeAll(() => {
  server.listen({
    // 定義されていないリクエストはエラーとして扱う
    // これにより、モックし忘れたAPIコールを検出できる
    onUnhandledRequest: 'error',
  });
});

// 各テスト後にハンドラーをリセット
// これにより、テスト間でのハンドラーの干渉を防ぐ
afterEach(() => {
  server.resetHandlers();
});

// 全テスト終了後にサーバーを停止
afterAll(() => {
  server.close();
});
