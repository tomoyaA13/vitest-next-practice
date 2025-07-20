/**
 * @file UserList.test.tsx
 * @description ユーザー一覧表示コンポーネントの単体テスト
 * 非同期データ取得、ローディング状態、エラーハンドリングを含む包括的なテスト
 */

// ========== インポート ==========
// beforeEach: 各テストの前に実行される処理を定義
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserList } from '../UserList';

/**
 * fetchのモック設定
 * global.fetchをvi.fn()でモック化することで、
 * 実際のAPIコールを行わずにテストを実行可能
 */
global.fetch = vi.fn();

/**
 * UserListコンポーネントのテストスイート
 * 
 * このコンポーネントは以下の状態を持つ：
 * 1. ローディング中（初期状態）
 * 2. データ取得成功（ユーザー一覧表示）
 * 3. エラー発生（エラーメッセージ表示）
 */
describe('UserList', () => {
  /**
   * 各テストの前に実行される前処理
   * モックをクリアして、テスト間の干渉を防ぐ
   */
  beforeEach(() => {
    // vi.clearAllMocks(): 全てのモック関数の呼び出し履歴をクリア
    // これにより、各テストが独立した状態で実行される
    vi.clearAllMocks();
  });

  /**
   * テスト1: 正常なデータ取得とユーザー一覧の表示
   * APIから正常にデータを取得し、ユーザー情報が表示されることを検証
   */
  it('ユーザー一覧が表示されること', async () => {
    // ========== Arrange（準備）==========
    // テスト用のモックデータを定義
    const mockUsers = [
      { id: 1, name: '山田太郎', email: 'yamada@example.com' },
      { id: 2, name: '鈴木花子', email: 'suzuki@example.com' },
    ];

    // fetchをモック化して成功レスポンスを返すように設定
    // mockResolvedValueOnce: 1回だけ指定した値でPromiseを解決
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,                               // HTTPステータスが成功
      json: async () => mockUsers,            // JSONパース結果を返す非同期関数
    });

    // ========== Act（実行）==========
    // containerを取得してコンポーネントをレンダリング
    const { container } = render(<UserList />);

    // ========== Assert 1（ローディング状態の確認）==========
    // 初期状態ではSkeletonコンポーネントが表示される
    // Shadcn UIのSkeletonはdata-slot="skeleton"属性を持つ
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(3);  // 3つのスケルトンが表示される

    // ========== Assert 2（データ取得後の表示確認）==========
    // waitFor: 非同期的な状態変更を待つ
    // useEffectでのデータ取得が完了するまで待機
    await waitFor(() => {
      // ユーザー情報が正しく表示されていることを確認
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('suzuki@example.com')).toBeInTheDocument();
    });
  });

  /**
   * テスト2: ネットワークエラー時のエラーメッセージ表示
   * fetchが例外をスローした場合のエラーハンドリングを検証
   */
  it('エラー時にエラーメッセージが表示されること', async () => {
    // ========== Arrange（準備）==========
    // fetchをモック化してエラーをスローするように設定
    // mockRejectedValueOnce: 1回だけPromiseをrejectする
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // ========== Act（実行）==========
    render(<UserList />);

    // ========== Assert（検証）==========
    // エラーメッセージが表示されるまで待つ
    await waitFor(() => {
      // エラーメッセージが正しいフォーマットで表示されることを確認
      expect(screen.getByText('エラー: Network error')).toBeInTheDocument();
    });
  });

  /**
   * テスト3: APIレスポンスエラー時のエラーメッセージ表示
   * HTTPステータスがエラー（ok: false）の場合のハンドリングを検証
   */
  it('APIエラー時にエラーメッセージが表示されること', async () => {
    // ========== Arrange（準備）==========
    // fetchをモック化してエラーレスポンスを返すように設定
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,  // HTTPステータスがエラー（4xx, 5xx等）
    });

    // ========== Act（実行）==========
    render(<UserList />);

    // ========== Assert（検証）==========
    // カスタムエラーメッセージが表示されることを確認
    await waitFor(() => {
      // コンポーネント内で定義されたエラーメッセージ
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });
});

/**
 * 非同期データ取得コンポーネントのテストのポイント：
 * 
 * 1. fetchのモック化
 *    - global.fetch = vi.fn() でグローバルなfetch関数をモック化
 *    - 実際のAPIコールを防ぎ、テストの高速化と安定性を確保
 * 
 * 2. 異なる状態のテスト
 *    - ローディング状態：初期表示時のスケルトン
 *    - 成功状態：データが正しく表示される
 *    - エラー状態：適切なエラーメッセージ
 * 
 * 3. 非同期処理の待機
 *    - waitForを使用してuseEffect内の非同期処理を待つ
 *    - 状態更新が完了してからアサーションを実行
 * 
 * 4. モックのクリーンアップ
 *    - beforeEachでモックをクリア
 *    - テスト間の干渉を防ぐ
 * 
 * 5. Shadcn UIコンポーネントのクエリ
 *    - data-slot属性を使用したクエリ
 *    - コンポーネントの内部実装に依存しない方法も検討
 * 
 * 6. エラーハンドリングの網羅性
 *    - ネットワークエラー（例外）
 *    - HTTPエラー（ステータスコード）
 *    - その他の予期しないエラー
 */

/**
 * 追加で考慮すべきテストケース：
 * 
 * - 空のユーザーリストの表示
 * - ページネーション（実装されている場合）
 * - リフレッシュ機能
 * - ユーザー詳細へのナビゲーション
 * - ソート・フィルター機能
 * - リトライ機能（エラー時の再取得）
 * - キャンセル可能なリクエスト（AbortController）
 * - レースコンディションの処理
 */

/**
 * パフォーマンステストの観点：
 * 
 * - 大量データ（1000件以上）の表示
 * - 仮想スクロール（実装されている場合）
 * - メモリリークの防止（クリーンアップ処理）
 * - 不要な再レンダリングの防止
 */
