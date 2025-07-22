// src/components/__stories__/UserList.stories.tsx

/**
 * 非同期処理を含むコンポーネントのStorybookファイル
 *
 * このファイルでは、APIからデータを取得するコンポーネントのストーリーを
 * MSW（Mock Service Worker）を使って作成する方法を説明します。
 */

import type { Meta, StoryObj } from '@storybook/react';
import { UserList } from '@/components/UserList';
import { http, HttpResponse, delay } from 'msw'; // ストーリー固有のハンドラー作成用
// 既存のMSWハンドラーをインポート
import { handlers as defaultHandlers, errorHandlers, specialHandlers, mockUsers, mswMockUsers } from '../../mocks/handlers';

// msw-storybook-addonがインストールされていない場合の警告
// この部分は、msw-storybook-addonをインストール後に削除してください
if (typeof window !== 'undefined' && !window.msw) {
  console.warn(
    'MSW Storybook Addonがインストールされていません。\n' + '以下のコマンドを実行してください：\n' + 'pnpm add -D msw-storybook-addon',
  );
}

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
 * デフォルトのハンドラーを使用して、基本的な成功レスポンスを返します。
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '正常にユーザーリストを取得して表示する例（山田太郎、鈴木花子）',
      },
    },
    // msw パラメータで、このストーリー専用のモックハンドラーを定義
    msw: {
      handlers: defaultHandlers, // 既存のデフォルトハンドラーを使用
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
        // 注: このケースは特殊なので、インラインで定義
        // handlers.tsに永続的なローディング用ハンドラーを追加することも可能
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
        story: '1秒の遅延後にデータを表示（実際のAPIの挙動を再現）',
      },
    },
    msw: {
      handlers: [specialHandlers.delayedResponse], // 既存の遅延ハンドラーを使用
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
        story: 'APIエラー時のエラーメッセージ表示（500エラー）',
      },
    },
    msw: {
      handlers: [errorHandlers.serverError], // 既存のサーバーエラーハンドラーを使用
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
      handlers: [errorHandlers.networkError], // 既存のネットワークエラーハンドラーを使用
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
      handlers: [specialHandlers.emptyResponse], // 既存の空レスポンスハンドラーを使用
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
      handlers: defaultHandlers, // 既存のデフォルトハンドラーを使用
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
      handlers: [specialHandlers.delayedResponse], // 既存の遅延ハンドラーを使用（1秒遅延）
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
      // ユーザー名が表示されるまで待機（mswMockUsersのデータが表示される）
      await waitFor(() => expect(canvas.getByText('佐藤次郎')).toBeInTheDocument(), { timeout: 2000 });
    });

    await step('全ユーザーが表示されていることを確認', async () => {
      expect(canvas.getByText('佐藤次郎')).toBeInTheDocument();
      expect(canvas.getByText('田中美咲')).toBeInTheDocument();
      expect(canvas.getByText('高橋健一')).toBeInTheDocument();
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
      handlers: defaultHandlers, // 既存のデフォルトハンドラーを使用
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
      <div
        className='dark'
        style={{
          backgroundColor: '#1a1a1a',
          padding: '20px',
          minHeight: '400px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
