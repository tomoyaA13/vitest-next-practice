import type { Preview } from '@storybook/nextjs-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '../src/app/globals.css'; // Tailwind CSSとグローバルスタイルを適用

// デフォルトのMSWハンドラーをインポート
import { handlers } from '../src/mocks/handlers';

// MSWの初期化
initialize({
  onUnhandledRequest: 'bypass', // 未定義のリクエストはバイパス
});

const preview: Preview = {
  // MSWローダーを追加
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // グローバルMSWハンドラーを設定
    // これにより、特別な設定がないストーリーでも基本的なハンドラーが利用可能
    msw: {
      handlers: handlers,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
