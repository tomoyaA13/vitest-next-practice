// src/components/__stories__/ConfirmDialog.stories.tsx

/**
 * ダイアログコンポーネントのStorybookファイル
 * 
 * このファイルでは、ダイアログの開閉、ユーザーインタラクション、
 * アクセシビリティなどをテストする方法を説明します。
 * 
 * ■ ダイアログのテストの特徴
 * - 開閉状態の管理
 * - ユーザーの選択（確認/キャンセル）の処理
 * - キーボードナビゲーション（Escキーなど）
 * - フォーカス管理
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, waitFor } from '@storybook/test';
import { useState } from 'react';
import { ConfirmDialog } from '../ConfirmDialog';
import { Button } from '../Button';

/**
 * ■ ダイアログのテストにおける課題と解決策
 * 
 * 課題: ダイアログは通常、親コンポーネントから状態を管理される
 * 解決策: ラッパーコンポーネントを作成して、状態管理を含めたテストを行う
 */

/**
 * ラッパーコンポーネント
 * 
 * Storybookでダイアログをテストするために、
 * 状態管理を含むラッパーコンポーネントを作成します。
 * これにより、実際の使用方法に近い形でテストできます。
 */
const ConfirmDialogWithButton = ({ 
  title, 
  description,
  onConfirm,
  buttonText = '削除する'
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  
  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="primary">
        {buttonText}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        title={title}
        description={description}
      />
    </>
  );
};

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '確認ダイアログコンポーネント。重要な操作の前にユーザーの確認を求めます。',
      },
    },
  },
  tags: ['autodocs'],
  
  /**
   * argTypes: ダイアログコンポーネントのプロパティ設定
   * 
   * ダイアログ特有のプロパティ：
   * - open: 表示/非表示の状態
   * - onOpenChange: 状態変更のコールバック
   * - onConfirm: 確認ボタンクリック時のコールバック
   */
  argTypes: {
    open: {
      control: 'boolean',
      description: 'ダイアログの表示状態',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'ダイアログの開閉状態が変更された時のコールバック',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    onConfirm: {
      action: 'confirmed',
      description: '確認ボタンがクリックされた時のコールバック',
      table: {
        type: { summary: '() => void' },
      },
    },
    title: {
      control: 'text',
      description: 'ダイアログのタイトル',
      table: {
        type: { summary: 'string' },
      },
    },
    description: {
      control: 'text',
      description: 'ダイアログの説明文',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  
  // デフォルトのargs
  args: {
    open: true, // Storybookでは常に表示状態から始める
    title: '確認',
    description: 'この操作を実行してもよろしいですか？',
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default: デフォルト表示
 * 
 * ダイアログが開いた状態を表示します。
 * Controlsパネルでtitleやdescriptionを変更して、
 * 表示内容をカスタマイズできます。
 */
export const Default: Story = {
  args: {
    open: true,
    title: '削除の確認',
    description: 'この項目を削除してもよろしいですか？この操作は取り消せません。',
  },
};

/**
 * WithInteraction: インタラクション付き
 * 
 * ボタンクリックでダイアログを開き、
 * 実際の使用シナリオを再現します。
 */
export const WithInteraction: Story = {
  render: () => (
    <ConfirmDialogWithButton
      title="アカウントの削除"
      description="アカウントを削除すると、すべてのデータが失われます。本当に削除しますか？"
      onConfirm={() => console.log('削除が確認されました')}
      buttonText="アカウントを削除"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ステップ1: ボタンをクリックしてダイアログを開く
    const openButton = canvas.getByRole('button', { name: 'アカウントを削除' });
    await userEvent.click(openButton);
    
    // ステップ2: ダイアログが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('アカウントの削除')).toBeInTheDocument();
      expect(canvas.getByText(/アカウントを削除すると/)).toBeInTheDocument();
    });
  },
};

/**
 * ConfirmAction: 確認アクション
 * 
 * 確認ボタンをクリックした場合の動作を確認します。
 * onConfirmコールバックが実行され、ダイアログが閉じます。
 */
export const ConfirmAction: Story = {
  render: () => (
    <ConfirmDialogWithButton
      title="ファイルの削除"
      description="選択したファイルを削除します。"
      onConfirm={() => alert('ファイルが削除されました')}
      buttonText="ファイルを削除"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ダイアログを開く
    const openButton = canvas.getByRole('button', { name: 'ファイルを削除' });
    await userEvent.click(openButton);
    
    // 確認ボタンをクリック
    const confirmButton = await canvas.findByRole('button', { name: '確認' });
    await userEvent.click(confirmButton);
    
    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(canvas.queryByText('ファイルの削除')).not.toBeInTheDocument();
    });
  },
};

/**
 * CancelAction: キャンセルアクション
 * 
 * キャンセルボタンをクリックした場合の動作を確認します。
 * onConfirmは実行されず、ダイアログが閉じます。
 */
export const CancelAction: Story = {
  render: () => (
    <ConfirmDialogWithButton
      title="変更の破棄"
      description="保存されていない変更があります。本当に破棄しますか？"
      onConfirm={() => console.log('変更が破棄されました')}
      buttonText="変更を破棄"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ダイアログを開く
    const openButton = canvas.getByRole('button', { name: '変更を破棄' });
    await userEvent.click(openButton);
    
    // キャンセルボタンをクリック
    const cancelButton = await canvas.findByRole('button', { name: 'キャンセル' });
    await userEvent.click(cancelButton);
    
    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(canvas.queryByText('変更の破棄')).not.toBeInTheDocument();
    });
  },
};

/**
 * EscapeKeyClose: Escキーでの閉じる
 * 
 * Escキーを押すとダイアログが閉じることを確認します。
 * アクセシビリティの観点から重要な機能です。
 */
export const EscapeKeyClose: Story = {
  render: () => (
    <ConfirmDialogWithButton
      title="操作の確認"
      description="この操作を続行しますか？"
      onConfirm={() => console.log('確認されました')}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ダイアログを開く
    const openButton = canvas.getByRole('button', { name: '削除する' });
    await userEvent.click(openButton);
    
    // ダイアログが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('操作の確認')).toBeInTheDocument();
    });
    
    // Escキーを押す
    await userEvent.keyboard('{Escape}');
    
    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(canvas.queryByText('操作の確認')).not.toBeInTheDocument();
    });
  },
};

/**
 * LongContent: 長いコンテンツ
 * 
 * 長いタイトルや説明文を含む場合の表示を確認します。
 * テキストの折り返しやスクロールが適切に処理されることを確認します。
 */
export const LongContent: Story = {
  args: {
    open: true,
    title: '非常に重要な操作の確認：このアクションは取り消すことができません',
    description: `この操作を実行すると、以下の影響があります：
    
    1. すべてのユーザーデータが完全に削除されます
    2. 関連するファイルやドキュメントも削除されます
    3. この操作は取り消すことができません
    4. バックアップからの復元も不可能です
    
    本当にこの操作を続行してもよろしいですか？続行する場合は「確認」ボタンをクリックしてください。`,
  },
};

/**
 * DifferentVariants: 異なるバリエーション
 * 
 * 様々な用途のダイアログを一覧で表示します。
 * デザインの一貫性を確認できます。
 */
export const DifferentVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ConfirmDialogWithButton
        title="保存"
        description="変更を保存しますか？"
        onConfirm={() => console.log('保存')}
        buttonText="保存"
      />
      <ConfirmDialogWithButton
        title="ログアウト"
        description="ログアウトしてもよろしいですか？"
        onConfirm={() => console.log('ログアウト')}
        buttonText="ログアウト"
      />
      <ConfirmDialogWithButton
        title="購入の確認"
        description="カートの商品を購入します。合計金額: ¥3,980"
        onConfirm={() => console.log('購入')}
        buttonText="購入する"
      />
    </div>
  ),
};

/**
 * MobileView: モバイルビュー
 * 
 * モバイル画面でのダイアログ表示を確認します。
 * 画面サイズに応じて適切に表示されることを確認します。
 */
export const MobileView: Story = {
  args: {
    open: true,
    title: 'モバイルでの確認',
    description: 'モバイル画面でも適切に表示されることを確認します。',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * WithCustomStyling: カスタムスタイリング
 * 
 * ダイアログの見た目をカスタマイズする例です。
 * 実際のプロジェクトでは、テーマに合わせたスタイリングが必要になることがあります。
 */
export const WithCustomStyling: Story = {
  args: {
    open: true,
    title: '⚠️ 警告',
    description: 'この操作は危険です。十分に注意してください。',
  },
  decorators: [
    (Story) => (
      <div style={{ 
        '--dialog-bg': '#fff3cd',
        '--dialog-border': '#ffeaa7',
      } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
};

/**
 * AccessibilityTest: アクセシビリティテスト
 * 
 * キーボードナビゲーションとスクリーンリーダーの
 * サポートを確認します。
 */
export const AccessibilityTest: Story = {
  render: () => (
    <ConfirmDialogWithButton
      title="アクセシビリティテスト"
      description="タブキーでボタン間を移動できることを確認してください。"
      onConfirm={() => console.log('確認')}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ダイアログを開く
    const openButton = canvas.getByRole('button', { name: '削除する' });
    await userEvent.click(openButton);
    
    // タブキーでフォーカスを移動
    await userEvent.tab();
    
    // キャンセルボタンにフォーカスが移動することを確認
    const cancelButton = canvas.getByRole('button', { name: 'キャンセル' });
    expect(cancelButton).toHaveFocus();
    
    // もう一度タブキーで確認ボタンに移動
    await userEvent.tab();
    
    const confirmButton = canvas.getByRole('button', { name: '確認' });
    expect(confirmButton).toHaveFocus();
  },
};