/**
 * @file browser.ts
 * @description ブラウザ環境（開発環境）用のMSWワーカー設定
 * 開発中に実際のAPIの代わりにモックを使用する場合に利用
 */

import { setupWorker } from 'msw/browser';
import { handlers, developmentHandlers } from './handlers';

/**
 * ブラウザ環境で使用するMSWワーカーインスタンス
 * 基本ハンドラーと開発環境用ハンドラーを結合
 */
export const worker = setupWorker(
  ...handlers,
  ...developmentHandlers
);

/**
 * ワーカーの起動オプション
 */
export const workerOptions = {
  // 未定義のリクエストは実際のAPIに転送
  onUnhandledRequest: 'bypass' as const,
  
  // Service Workerのスコープ
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
  
  // ログ出力の設定
  quiet: false, // trueにするとコンソールログを抑制
};

/**
 * 開発環境でのMSW起動ヘルパー
 * 
 * 使用例（main.tsxまたはindex.tsx）:
 * ```typescript
 * import { enableMocking } from './mocks/browser';
 * 
 * enableMocking().then(() => {
 *   ReactDOM.createRoot(document.getElementById('root')!).render(
 *     <React.StrictMode>
 *       <App />
 *     </React.StrictMode>
 *   );
 * });
 * ```
 */
export async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // MSWのService Workerを起動
  return worker.start(workerOptions);
}

/**
 * 動的にハンドラーを追加する関数
 * 開発中に特定の状況をシミュレートする際に使用
 */
export function addCustomHandler(handler: any) {
  worker.use(handler);
}

/**
 * 全てのハンドラーをリセット
 */
export function resetHandlers() {
  worker.resetHandlers();
}

/**
 * ワーカーを停止
 */
export function stopWorker() {
  worker.stop();
}
