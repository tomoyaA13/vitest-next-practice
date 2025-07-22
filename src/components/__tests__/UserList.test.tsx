/**
 * @file UserList.test.tsx
 * @description ユーザー一覧表示コンポーネントの単体テスト
 * MSW推奨のハンドラーパターンを使用した実装
 */

// ========== インポート ==========
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserList } from '../UserList';

// MSWサーバーとハンドラーのインポート
import { server } from '@/mocks/server';
import {
  mockUsers,
  mswMockUsers,
  errorHandlers,
  specialHandlers,
  createRequestCaptureHandler,
  createCustomResponseHandler,
} from '@/mocks/handlers';

/**
 * UserListコンポーネントのテストスイート
 *
 * MSWハンドラーパターンを使用した実装
 * - グローバルセットアップで基本的なモックサーバーは起動済み
 * - 各テストで必要に応じてハンドラーを上書き
 * - テスト後は自動的にハンドラーがリセットされる
 */
describe('UserList', () => {
  /**
   * 各テストの前に実行される前処理
   * vi.fn()を使用している箇所のモックをクリア
   */
  beforeEach(() => {
    // vi.clearAllMocks(): 全てのモック関数の呼び出し履歴をクリア
    vi.clearAllMocks();
  });

  /**
   * テスト1: 正常なデータ取得とユーザー一覧の表示
   * デフォルトハンドラーを使用
   */
  it('ユーザー一覧が表示されること', async () => {
    // ========== Act（実行）==========
    // デフォルトハンドラーが自動的に使用される
    render(<UserList />);

    // ========== Assert（データ取得後の表示確認）==========
    // ローディング中はスケルトンが表示されるが、
    // 最終的にユーザー情報が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('suzuki@example.com')).toBeInTheDocument();
    });
  });

  /**
   * テスト2: ネットワークエラー時のエラーメッセージ表示
   */
  it('エラー時にエラーメッセージが表示されること', async () => {
    // ========== Arrange（準備）==========
    // エラーハンドラーを使用
    server.use(errorHandlers.networkError);

    // ========== Act（実行）==========
    render(<UserList />);

    // ========== Assert（検証）==========
    await waitFor(() => {
      expect(screen.getByText(/エラー:/)).toBeInTheDocument();
    });
  });

  /**
   * テスト3: APIレスポンスエラー時のエラーメッセージ表示
   */
  it('APIエラー時にエラーメッセージが表示されること', async () => {
    // ========== Arrange（準備）==========
    // 500エラーハンドラーを使用
    server.use(errorHandlers.serverError);

    // ========== Act（実行）==========
    render(<UserList />);

    // ========== Assert（検証）==========
    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });
});

/**
 * MSWを使用したUserListコンポーネントの拡張テストスイート
 * より詳細なテストケースを含む
 */
describe('UserList - MSW拡張テスト', () => {
  /**
   * テスト1: 別のモックデータでの表示
   */
  it('MSWでモックしたユーザー一覧が表示されること', async () => {
    // MSW用の別データハンドラーを使用
    server.use(specialHandlers.mswData);

    render(<UserList />);

    // データ取得後の表示確認
    await waitFor(() => {
      expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
      expect(screen.getByText('sato@example.com')).toBeInTheDocument();
      expect(screen.getByText('田中美咲')).toBeInTheDocument();
      expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
      expect(screen.getByText('高橋健一')).toBeInTheDocument();
      expect(screen.getByText('takahashi@example.com')).toBeInTheDocument();
    });
  });

  /**
   * テスト2: 404エラーのシミュレーション
   */
  it('MSWで404エラーが返された場合', async () => {
    server.use(errorHandlers.notFound);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });

  /**
   * テスト3: 503エラーのシミュレーション
   */
  it('MSWで503エラーが返された場合', async () => {
    server.use(errorHandlers.serviceUnavailable);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });

  /**
   * テスト4: レスポンス遅延のシミュレーション
   */
  it('MSWでレスポンス遅延をシミュレート', async () => {
    server.use(specialHandlers.delayedResponse);

    render(<UserList />);

    // データが最終的に表示されることを確認
    await waitFor(
      () => {
        expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
      },
      { timeout: 2000 },
    ); // タイムアウトを延長
  });

  /**
   * テスト5: カスタム遅延時間のテスト
   */
  it('MSWでカスタム遅延時間をテスト', async () => {
    // 500ミリ秒の遅延
    server.use(specialHandlers.customDelayedResponse(500));

    render(<UserList />);

    // データ表示の確認
    await waitFor(
      () => {
        expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  /**
   * テスト6: 空のレスポンスの処理
   */
  it('MSWで空の配列が返された場合', async () => {
    server.use(specialHandlers.emptyResponse);

    render(<UserList />);

    // 空のレスポンスの場合、エラーメッセージは表示されず、
    // ユーザーデータも表示されないことを確認
    await waitFor(() => {
      // ローディングが完了していることを確認
      // （エラーメッセージもユーザーデータも表示されていない）
      expect(screen.queryByText(/エラー:/)).not.toBeInTheDocument();
      expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();
    });
  });

  /**
   * テスト7: リクエストの詳細を検証
   */
  it('MSWでリクエストの詳細を検証', async () => {
    let capturedRequest: Request | null = null;

    // リクエストキャプチャハンドラーを使用
    server.use(
      createRequestCaptureHandler((request) => {
        capturedRequest = request;
      }),
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
    });

    // リクエストの詳細を検証
    expect(capturedRequest).not.toBeNull();
    if (capturedRequest) {
      expect(capturedRequest.method).toBe('GET');
      expect(capturedRequest.url).toContain('/api/users');
    }
  });

  /**
   * テスト8: カスタムレスポンスのテスト
   */
  it('カスタムレスポンスを返す', async () => {
    const customData = [{ id: 999, name: 'カスタムユーザー', email: 'custom@example.com' }];

    // カスタムレスポンスハンドラーを使用
    server.use(createCustomResponseHandler(customData));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('カスタムユーザー')).toBeInTheDocument();
      expect(screen.getByText('custom@example.com')).toBeInTheDocument();
    });
  });

  /**
   * テスト9: 条件付きレスポンス
   */
  it('MSWで条件に応じて異なるレスポンスを返す', async () => {
    // 条件付きレスポンスハンドラーを使用
    // （最初のリクエストは503エラー、その後は成功）
    server.use(specialHandlers.conditionalResponse);

    render(<UserList />);

    // 現在のUserListコンポーネントはリトライ機能がないため、
    // 最初のエラーで止まります
    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });
});

/**
 * MSWハンドラーパターンのメリット：
 *
 * 1. コードの整理
 *    - ハンドラーが一箇所に集約され、管理しやすい
 *    - テストファイルがすっきりする
 *
 * 2. 再利用性
 *    - 同じハンドラーを複数のテストで使い回せる
 *    - エラーパターンの共通化
 *
 * 3. 保守性
 *    - APIの仕様変更時の修正が容易
 *    - モックデータの一元管理
 *
 * 4. 拡張性
 *    - 新しいハンドラーの追加が簡単
 *    - カスタムハンドラーの作成も容易
 *
 * 5. チーム開発
 *    - モックの仕様が明確
 *    - 開発環境でも同じモックを使用可能
 */

/**
 * グローバルセットアップとの連携：
 *
 * vitest.setup.tsで以下が設定済み：
 * - beforeAll: サーバーの起動
 * - afterEach: ハンドラーのリセット
 * - afterAll: サーバーの停止
 *
 * そのため、各テストファイルでは
 * セットアップ/クリーンアップ処理が不要
 */
