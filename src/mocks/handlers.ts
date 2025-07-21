/**
 * @file handlers.ts
 * @description MSWのリクエストハンドラーを集中管理
 * APIモックの定義を一元化することで、テストと開発環境で共有可能
 */

import { http, HttpResponse } from 'msw';

// ========== モックデータ ==========
export const mockUsers = [
  { id: 1, name: '山田太郎', email: 'yamada@example.com' },
  { id: 2, name: '鈴木花子', email: 'suzuki@example.com' },
];

export const mswMockUsers = [
  { id: 3, name: '佐藤次郎', email: 'sato@example.com' },
  { id: 4, name: '田中美咲', email: 'tanaka@example.com' },
  { id: 5, name: '高橋健一', email: 'takahashi@example.com' },
];

// ========== 基本ハンドラー ==========
/**
 * アプリケーション全体で使用する基本的なAPIハンドラー
 */
export const handlers = [
  // ユーザー一覧取得API（成功レスポンス）
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),

  // ユーザー詳細取得API（必要に応じて追加）
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
];

// ========== エラーハンドラー ==========
/**
 * エラーレスポンスをテストするためのハンドラー
 */
export const errorHandlers = {
  // ネットワークエラー
  networkError: http.get('/api/users', () => {
    return HttpResponse.error();
  }),

  // 500エラー
  serverError: http.get('/api/users', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  // 404エラー
  notFound: http.get('/api/users', () => {
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),

  // 503エラー（サービス利用不可）
  serviceUnavailable: http.get('/api/users', () => {
    return new HttpResponse(null, {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }),
};

// ========== 特殊ケース用ハンドラー ==========
/**
 * 特定のテストケース用のハンドラー
 */
export const specialHandlers = {
  // 空のレスポンス
  emptyResponse: http.get('/api/users', () => {
    return HttpResponse.json([]);
  }),

  // 遅延レスポンス（1秒）
  delayedResponse: http.get('/api/users', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json(mswMockUsers);
  }),

  // 遅延レスポンス（カスタム遅延時間）
  customDelayedResponse: (delay: number) =>
    http.get('/api/users', async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return HttpResponse.json(mswMockUsers);
    }),

  // MSW用の別データ
  mswData: http.get('/api/users', () => {
    return HttpResponse.json(mswMockUsers);
  }),

  // 条件付きレスポンス（リクエスト回数によって変化）
  conditionalResponse: (() => {
    let requestCount = 0;
    return http.get('/api/users', () => {
      requestCount++;

      if (requestCount === 1) {
        return new HttpResponse(null, { status: 503 });
      }

      return HttpResponse.json(mswMockUsers);
    });
  })(),
};

// ========== 開発環境用ハンドラー ==========
/**
 * 開発環境で使用する追加のハンドラー
 * （必要に応じて拡張）
 */
export const developmentHandlers = [
  // 認証API
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: { id: 1, email: body.email, name: 'テストユーザー' },
      });
    }

    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // ログアウトAPI
  http.post('/api/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),
];

// ========== ユーティリティ関数 ==========
/**
 * リクエストの詳細をキャプチャするハンドラーを作成
 */
export const createRequestCaptureHandler = (onCapture: (request: Request) => void) => {
  return http.get('/api/users', ({ request }) => {
    onCapture(request);
    return HttpResponse.json(mswMockUsers);
  });
};

/**
 * カスタムレスポンスを返すハンドラーを作成
 */
export const createCustomResponseHandler = (data: any, status: number = 200) => {
  return http.get('/api/users', () => {
    return HttpResponse.json(data, { status });
  });
};
