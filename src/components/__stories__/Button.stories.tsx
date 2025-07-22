// src/components/__stories__/Button.stories.tsx

/**
 * Storybookのストーリーファイルの基本構造
 *
 * Storybookは、UIコンポーネントを独立した環境で開発・テストするためのツールです。
 * このファイルでは、Buttonコンポーネントの様々な状態（ストーリー）を定義します。
 */

// 必要なインポート
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/Button';

/**
 * Meta（メタデータ）の定義
 *
 * Metaオブジェクトは、Storybookがこのコンポーネントをどのように扱うかを設定します。
 * これはストーリーファイルごとに1つだけ定義します。
 */
const meta = {
  // Storybookのサイドバーでの表示場所を指定
  // スラッシュで階層を作ることができます
  title: 'Components/Button',

  // このストーリーファイルが扱うコンポーネントを指定
  component: Button,

  // レイアウト設定
  // 'centered': コンポーネントを中央に配置
  // 'fullscreen': 全画面表示
  // 'padded': パディング付き（デフォルト）
  parameters: {
    layout: 'centered',
    // Storybookのドキュメントアドオンの設定
    docs: {
      description: {
        component: '再利用可能なボタンコンポーネント。複数のバリアントとサイズをサポートしています。',
      },
    },
  },

  // タグを使ってストーリーを分類
  // 'autodocs'タグを付けると自動的にドキュメントページが生成されます
  tags: ['autodocs'],

  // argTypes: プロパティのコントロール設定
  // Storybookのコントロールパネルでプロパティを操作できるようになります
  argTypes: {
    variant: {
      control: 'radio', // ラジオボタンでの選択
      options: ['primary', 'secondary'],
      description: 'ボタンの外観バリアント',
      table: {
        type: { summary: 'primary | secondary' },
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean', // チェックボックスでの切り替え
      description: 'ボタンの無効化状態',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      action: 'clicked', // クリックイベントをアクションパネルに記録
      description: 'クリックイベントハンドラー',
      table: {
        type: { summary: '() => void' },
      },
    },
    children: {
      control: 'text', // テキスト入力での編集
      description: 'ボタンの内容',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },

  // デフォルトのargs（プロパティ値）
  // すべてのストーリーで共通して使用されます
  args: {
    children: 'ボタン',
  },
} satisfies Meta<typeof Button>;

// メタデータをエクスポート（必須）
export default meta;

// ストーリーの型を定義
type Story = StoryObj<typeof meta>;

/**
 * 個別のストーリー（コンポーネントの状態）を定義
 *
 * 各ストーリーは、コンポーネントの特定の状態を表現します。
 * ストーリー名は、Storybookのサイドバーに表示されます。
 */

// 基本的なストーリー
export const Default: Story = {
  args: {
    children: 'デフォルトボタン',
    variant: 'primary',
  },
};

// プライマリバリアント
export const Primary: Story = {
  args: {
    children: 'プライマリボタン',
    variant: 'primary',
  },
  // ストーリー固有のパラメータ
  parameters: {
    docs: {
      description: {
        story: '主要なアクションに使用するプライマリボタン',
      },
    },
  },
};

// セカンダリバリアント
export const Secondary: Story = {
  args: {
    children: 'セカンダリボタン',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: '補助的なアクションに使用するセカンダリボタン',
      },
    },
  },
};

// 無効化状態
export const Disabled: Story = {
  args: {
    children: '無効なボタン',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'ユーザー操作を受け付けない無効化状態のボタン',
      },
    },
  },
};

// 長いテキストの場合
export const LongText: Story = {
  args: {
    children: 'とても長いテキストが入ったボタンの例です',
  },
};

/**
 * 高度な例：Play関数を使った操作のテスト
 *
 * Play関数を使うと、ストーリーが表示された後に
 * 自動的にユーザー操作をシミュレートできます。
 */
export const WithInteraction: Story = {
  args: {
    children: 'クリックしてみて',
    onClick: () => alert('ボタンがクリックされました！'),
  },
  play: async ({ canvasElement, step }) => {
    // @storybook/testing-libraryを使った操作テスト
    const { getByRole } = await import('@storybook/test');
    const { userEvent } = await import('@storybook/test');

    const button = getByRole(canvasElement, 'button');

    // ステップごとに操作を実行
    await step('ボタンをホバー', async () => {
      await userEvent.hover(button);
    });

    await step('ボタンをクリック', async () => {
      await userEvent.click(button);
    });
  },
};

/**
 * レンダリング関数を使ったカスタマイズ例
 *
 * より複雑な表示が必要な場合は、render関数を使ってカスタマイズできます。
 */
export const InContext: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '10px', padding: '20px', backgroundColor: '#f0f0f0' }}>
      <Button {...args} variant='primary'>
        保存
      </Button>
      <Button {...args} variant='secondary'>
        キャンセル
      </Button>
      <Button {...args} disabled>
        削除（無効）
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '実際の使用例：フォームのアクションボタン群',
      },
    },
  },
};

/**
 * デコレーターを使った例
 *
 * デコレーターを使うと、ストーリーの周りにラッパー要素を追加できます。
 */
export const WithDecorator: Story = {
  args: {
    children: 'ダークモードのボタン',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '40px',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/**
 * 複数のバリエーションを一度に表示
 *
 * すべてのバリエーションを一覧で確認したい場合の例
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '10px' }}>プライマリバリアント</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant='primary'>通常</Button>
          <Button variant='primary' disabled>
            無効
          </Button>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>セカンダリバリアント</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant='secondary'>通常</Button>
          <Button variant='secondary' disabled>
            無効
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'すべてのバリアントと状態の組み合わせ一覧',
      },
    },
  },
};
