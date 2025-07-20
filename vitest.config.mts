/**
 * @file vitest.config.mts
 * @description Vitestの設定ファイル
 * テスト環境、プラグイン、パスエイリアスなどを設定
 */

// Vitestの設定を定義するための関数
import { defineConfig } from 'vitest/config';

// ReactコンポーネントをViteで扱うためのプラグイン
// JSX/TSXの変換とReact Fast Refreshを提供
import react from '@vitejs/plugin-react';

// TypeScriptのパスマッピング（tsconfig.jsonのpaths）をViteで使用可能にする
import tsconfigPaths from 'vite-tsconfig-paths';

// Node.jsのpathモジュール（ファイルパスの操作用）
import path from 'path';

/**
 * Vitestの設定をエクスポート
 * defineConfigを使用することで、TypeScriptの型サポートを受けられる
 */
export default defineConfig({
  /**
   * Viteプラグインの設定
   * ビルドとテスト実行時の変換処理を定義
   */
  plugins: [
    // tsconfig.jsonのパスマッピングを解決
    // これにより、'@/components/Button' のようなインポートが可能になる
    tsconfigPaths(),
    
    // Reactの変換処理を有効化
    // JSX構文の変換とReact特有の最適化を行う
    react(),
  ],
  
  /**
   * テスト固有の設定
   */
  test: {
    /**
     * テスト環境の設定
     * 'jsdom': ブラウザ環境をシミュレート（DOMやWindow APIを提供）
     * その他のオプション: 'node', 'happy-dom', 'edge-runtime'
     */
    environment: 'jsdom',
    
    /**
     * グローバル変数の設定
     * true: describe, it, expect などをimportなしで使用可能
     * false: 明示的なimportが必要（推奨）
     */
    globals: true,
    
    /**
     * セットアップファイルの指定
     * 各テストファイルの実行前に読み込まれる
     * モックの設定やカスタムマッチャーの追加などを行う
     */
    setupFiles: ['./vitest.setup.ts'],
    
    /**
     * テストファイルのパターン
     * どのファイルをテストとして認識するかを定義
     * - 全てのディレクトリを再帰的に検索
     * - 'test' または 'spec' という名前のファイル
     * - 対応する拡張子: js, mjs, cjs, ts, mts, cts, jsx, tsx
     */
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    /**
     * カバレッジ設定
     * コードカバレッジの計測と出力形式を定義
     */
    coverage: {
      /**
       * レポートの形式
       * - text: コンソールに表示
       * - json: JSONファイルとして出力
       * - html: HTMLレポートを生成
       */
      reporter: ['text', 'json', 'html'],
      
      /**
       * カバレッジから除外するパターン
       * テスト対象外のファイルを指定
       */
      exclude: [
        'node_modules/',      // 外部ライブラリ
        'vitest.setup.ts',   // セットアップファイル自体
      ],
    },
  },
  
  /**
   * モジュール解決の設定
   * インポートパスの解決方法を定義
   */
  resolve: {
    /**
     * パスエイリアスの設定
     * '@' を src ディレクトリにマッピング
     * これにより、相対パスの代わりに '@/components/Button' のような
     * 絶対パスでインポートできる
     */
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

/**
 * 設定のポイント：
 * 
 * 1. プラグインの順序
 *    - tsconfigPaths() を react() より先に配置
 *    - パス解決を先に行ってからReact変換を実行
 * 
 * 2. テスト環境
 *    - jsdom: Reactコンポーネントのテストに必須
 *    - Node.js環境では window や document が存在しないため
 * 
 * 3. グローバル設定
 *    - globals: true でテストコードがシンプルに
 *    - ただし、明示的なimportの方が推奨される場合もある
 * 
 * 4. カバレッジ設定
 *    - 複数の形式で出力することで、CI/CDでも開発時でも確認可能
 *    - HTMLレポートは視覚的にカバレッジを確認できる
 * 
 * 5. パスエイリアス
 *    - srcディレクトリからの絶対パスインポートを可能に
 *    - リファクタリング時のパス変更を最小限に
 */

/**
 * 追加で検討すべき設定オプション：
 * 
 * - testTimeout: テストのタイムアウト時間を設定（デフォルト: 5000ms）
 * - maxConcurrency: 並列実行するテストファイルの最大数
 * - watchExclude: ウォッチモードで監視から除外するパターン
 * - reporters: テスト結果の出力形式をカスタマイズ
 * - sequence.shuffle: テストをランダムな順序で実行
 * - clearMocks: 各テスト後にモックを自動的にクリア
 * - mockReset: 各テスト後にモックの実装をリセット
 * - restoreMocks: 各テスト後にモックを元の実装に戻す
 * 
 * これらのオプションは必要に応じて test オブジェクト内に追加できます。
 */
