// src/components/__stories__/UserList.stories.tsx

/**
 * 非同期処理を含むコンポーネントのStorybookファイル
 * 
 * このファイルでは、APIからデータを取得するコンポーネントのストーリーを
 * MSW（Mock Service Worker）を使って作成する方法を説明します。
 */

import type { Meta, StoryObj } from '@storybook/react';
import { UserList } from '../UserList';
import { http, HttpResponse, delay } from 'msw';

// msw-storybook-addonがインストールされていない場合の警告
// この部分は、msw-storybook-addonをインストール後に削除してください
if (typeof window !== 'undefined' && !window.msw) {
  console.warn(
    'MSW Storybook Addonがインストールされていません。\n' +
    '以下のコマンドを実行してください：\n' +
    'pnpm add -D msw-storybook-addon'
  );
}

/**
 * MSWのハンドラーを定義
 * 
 * MSWを使うと、実際のAPIを呼び出すことなく、
 * ネットワークリクエストをインターセプトしてモックレスポンスを返せます。
 */
const mockUsers = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com' },
  { id: 2, name: '鈴木花子', email: 'suzuki@example.com' },
  { id: 3, name: '佐藤次郎', email: 'sato@example.com' },
];

const meta = {
  title: 'Components/UserList',
  component: UserList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'APIからユーザー一覧を取得して表示するコンポーネント',
      },
    },
  },
  tags: ['autodocs'],
  // デコレーターでコンポーネントを幅制限のあるコンテナで囲む
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 成功時のストーリー
 * 
 * MSWのハンドラーをストーリーごとに設定できます。
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '正常にユーザーリストを取得して表示する例',
      },
    },
    // msw パラメータで、このストーリー専用のモックハンドラーを定義
    msw: {
      handlers: [
        http.get('/api/users', () => {
          // 成功レスポンスを返す
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
  },
};

/**
 * ローディング状態のストーリー
 * 
 * delayを使って、ローディング状態を確認できるようにします。
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'データ取得中のローディング状態を表示',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', async () => {
          // 無限に遅延させることでローディング状態を維持
          await delay('infinite');
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
  },
};

/**
 * 遅延を含む実際的なローディング
 * 
 * 実際のAPIのような遅延を再現
 */
export const LoadingWithDelay: Story = {
  parameters: {
    docs: {
      description: {
        story: '2秒の遅延後にデータを表示（実際のAPIの挙動を再現）',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', async () => {
          // 2秒の遅延
          await delay(2000);
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
  },
};

/**
 * エラー状態のストーリー
 * 
 * APIがエラーを返す場合の表示を確認
 */
export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story: 'APIエラー時のエラーメッセージ表示',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          // 500エラーを返す
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

/**
 * ネットワークエラーのストーリー
 * 
 * ネットワーク自体に問題がある場合
 */
export const NetworkError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ネットワークエラー時の表示',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          // ネットワークエラーをシミュレート
          return HttpResponse.error();
        }),
      ],
    },
  },
};

/**
 * 空のリストのストーリー
 * 
 * ユーザーが0人の場合の表示
 */
export const EmptyList: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ユーザーが登録されていない場合の表示',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

/**
 * 大量データのストーリー
 * 
 * パフォーマンステストや表示確認用
 */
export const ManyUsers: Story = {
  parameters: {
    docs: {
      description: {
        story: '100人のユーザーを表示する例（パフォーマンステスト用）',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          // 100人分のモックデータを生成
          const manyUsers = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            name: `ユーザー ${i + 1}`,
            email: `user${i + 1}@example.com`,
          }));
          return HttpResponse.json(manyUsers);
        }),
      ],
    },
  },
};

/**
 * レスポンシブ確認用のストーリー
 * 
 * 異なる画面サイズでの表示を確認
 */
export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story: '異なる画面サイズでの表示確認',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
    // Storybookのビューポート設定
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
      defaultViewport: 'mobile',
    },
  },
};

/**
 * Play関数を使った操作シナリオ
 * 
 * ユーザーの操作フローをテスト
 */
export const InteractionTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'データ取得から表示までの流れを自動テスト',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', async () => {
          // 1秒の遅延後にデータを返す
          await delay(1000);
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const { waitFor, within, expect } = await import('@storybook/test');
    
    const canvas = within(canvasElement);
    
    await step('ローディング状態を確認', async () => {
      // Skeletonが表示されていることを確認
      const skeletons = canvas.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });
    
    await step('ユーザーリストが表示されるのを待つ', async () => {
      // ユーザー名が表示されるまで待機
      await waitFor(
        () => expect(canvas.getByText('田中太郎')).toBeInTheDocument(),
        { timeout: 2000 }
      );
    });
    
    await step('全ユーザーが表示されていることを確認', async () => {
      expect(canvas.getByText('田中太郎')).toBeInTheDocument();
      expect(canvas.getByText('鈴木花子')).toBeInTheDocument();
      expect(canvas.getByText('佐藤次郎')).toBeInTheDocument();
    });
  },
};

/**
 * ダークモードでの表示確認
 * 
 * テーマ切り替えに対応したコンポーネントの確認
 */
export const DarkMode: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ダークモードでの表示確認',
      },
    },
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json(mockUsers);
        }),
      ],
    },
    // グローバルテーマの設定
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '20px',
        minHeight: '400px' 
      }}>
        <Story />
      </div>
    ),
  ],
};