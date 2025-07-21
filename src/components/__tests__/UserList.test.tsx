/**
 * @file UserList.test.tsx
 * @description ユーザー一覧表示コンポーネントの単体テスト
 * 非同期データ取得、ローディング状態、エラーハンドリングを含む包括的なテスト
 */

// ========== インポート ==========
// beforeEach: 各テストの前に実行される処理を定義
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
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

/**
 * ====================================
 * MSW（Mock Service Worker）を使用したテスト例
 * ====================================
 * 
 * MSWは、ネットワークレベルでHTTPリクエストをインターセプトし、
 * より現実的なAPIモックを提供するライブラリです。
 * 
 * メリット：
 * - 実際のHTTPリクエスト/レスポンスの構造を保持
 * - リクエストの詳細（ヘッダー、メソッド、ボディ）を検証可能
 * - 開発環境でも同じモックを使用可能
 * - RESTful APIの仕様に沿ったテストが書ける
 */

// MSW用のモックデータ
const mswMockUsers = [
  { id: 3, name: '佐藤次郎', email: 'sato@example.com' },
  { id: 4, name: '田中美咲', email: 'tanaka@example.com' },
  { id: 5, name: '高橋健一', email: 'takahashi@example.com' },
];

// MSWのモックサーバーを設定
const server = setupServer(
  // デフォルトのハンドラー：成功レスポンス
  http.get('/api/users', () => {
    return HttpResponse.json(mswMockUsers);
  })
);

/**
 * MSWを使用したUserListコンポーネントのテストスイート
 * 
 * 注意: MSWとvi.fn()によるモックは同時に使用できないため、
 * 別のdescribeブロックで分離しています。
 */
describe('UserList - MSW版', () => {
  // テスト全体の前後処理
  beforeAll(() => {
    // MSWサーバーを起動
    server.listen({ 
      onUnhandledRequest: 'error' // 未定義のリクエストはエラーとして扱う
    });
  });
  
  afterEach(() => {
    // 各テスト後にハンドラーをリセット
    server.resetHandlers();
  });
  
  afterAll(() => {
    // 全テスト終了後にサーバーを停止
    server.close();
  });

  /**
   * テスト1: MSWを使用した正常なデータ取得
   */
  it('MSWでモックしたユーザー一覧が表示されること', async () => {
    const { container } = render(<UserList />);

    // ローディング状態の確認
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(3);

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
   * テスト2: ネットワークエラーのシミュレーション
   */
  it('MSWでネットワークエラーが発生した場合', async () => {
    // このテストのみネットワークエラーを返すように設定
    server.use(
      http.get('/api/users', () => {
        // ネットワークエラーをシミュレート
        return HttpResponse.error();
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/エラー:/)).toBeInTheDocument();
    });
  });

  /**
   * テスト3: HTTPステータスエラー（500）のシミュレーション
   */
  it('MSWで500エラーが返された場合', async () => {
    server.use(
      http.get('/api/users', () => {
        return new HttpResponse(null, { 
          status: 500,
          statusText: 'Internal Server Error' 
        });
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });

  /**
   * テスト4: 404エラーのシミュレーション
   */
  it('MSWで404エラーが返された場合', async () => {
    server.use(
      http.get('/api/users', () => {
        return new HttpResponse(null, { 
          status: 404,
          statusText: 'Not Found' 
        });
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });

  /**
   * テスト5: レスポンス遅延のシミュレーション
   */
  it('MSWでレスポンス遅延をシミュレート', async () => {
    server.use(
      http.get('/api/users', async () => {
        // 1秒の遅延をシミュレート
        await new Promise(resolve => setTimeout(resolve, 1000));
        return HttpResponse.json(mswMockUsers);
      })
    );

    const { container } = render(<UserList />);

    // 遅延中はローディング状態が続くことを確認
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(3);

    // データが最終的に表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
    }, { timeout: 2000 }); // タイムアウトを延長
  });

  /**
   * テスト6: 空のレスポンスの処理
   */
  it('MSWで空の配列が返された場合', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([]);
      })
    );

    const { container } = render(<UserList />);

    await waitFor(() => {
      // ローディングが終了していることを確認
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(0);
      
      // カードが表示されていないことを確認
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBe(0);
    });
  });

  /**
   * テスト7: リクエストの詳細を検証
   */
  it('MSWでリクエストの詳細を検証', async () => {
    let capturedRequest: Request | null = null;

    server.use(
      http.get('/api/users', ({ request }) => {
        // リクエストオブジェクトをキャプチャ
        capturedRequest = request;
        return HttpResponse.json(mswMockUsers);
      })
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
      
      // 必要に応じてヘッダーも検証可能
      // expect(capturedRequest.headers.get('Accept')).toBe('application/json');
    }
  });

  /**
   * テスト8: 条件付きレスポンス
   */
  it('MSWで条件に応じて異なるレスポンスを返す', async () => {
    let requestCount = 0;

    server.use(
      http.get('/api/users', () => {
        requestCount++;
        
        // 最初のリクエストはエラー、リトライは成功
        if (requestCount === 1) {
          return new HttpResponse(null, { status: 503 });
        }
        
        return HttpResponse.json(mswMockUsers);
      })
    );

    // 実際のアプリケーションでリトライ機能が実装されている場合のテスト例
    // 現在のUserListコンポーネントはリトライ機能がないため、
    // このテストは最初のエラーで止まります
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
    
    // リクエストが1回だけ実行されたことを確認
    expect(requestCount).toBe(1);
  });
});

/**
 * MSWを使用する際の注意点：
 * 
 * 1. セットアップ
 *    - server.listen()でサーバーを起動
 *    - server.resetHandlers()で各テスト後にリセット
 *    - server.close()でサーバーを停止
 * 
 * 2. ハンドラーの上書き
 *    - server.use()で特定のテスト用にハンドラーを上書き
 *    - 上書きは該当テストのみ有効
 * 
 * 3. 非同期処理
 *    - レスポンス遅延のシミュレーションが可能
 *    - リアルなネットワーク状況を再現
 * 
 * 4. リクエストの検証
 *    - リクエストオブジェクトにアクセス可能
 *    - ヘッダー、メソッド、ボディの検証が可能
 * 
 * 5. エラーハンドリング
 *    - HTTPステータスエラー
 *    - ネットワークエラー
 *    - タイムアウトなど
 */
