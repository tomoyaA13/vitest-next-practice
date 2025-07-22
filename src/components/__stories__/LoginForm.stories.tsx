// src/components/__stories__/LoginForm.stories.tsx

/**
 * フォームコンポーネントのStorybookファイル
 * 
 * このファイルでは、フォームのバリデーション、ユーザー入力、
 * エラー表示などをテストする方法を説明します。
 * 
 * ■ react-hook-formとzodの連携
 * - react-hook-form: フォームの状態管理とバリデーション
 * - zod: スキーマベースのバリデーション
 * これらが連携して、型安全なフォームを実現しています。
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, waitFor } from '@storybook/test';
import { LoginForm } from '../LoginForm';

/**
 * ■ Metaオブジェクトの設定
 * 
 * フォームコンポーネントの特徴：
 * - ユーザー入力を受け付ける
 * - バリデーションエラーを表示する
 * - 送信時にコールバックを実行する
 */
const meta = {
  title: 'Components/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered', // フォームを中央に配置
    docs: {
      description: {
        component: 'ログインフォームコンポーネント。メールアドレスとパスワードの入力をバリデーションします。',
      },
    },
  },
  tags: ['autodocs'],
  
  /**
   * argTypes: フォームコンポーネントのプロパティ設定
   * 
   * onSubmitはactionとして設定することで、
   * Actionsパネルで送信データを確認できます
   */
  argTypes: {
    onSubmit: {
      action: 'submitted', // Actionsパネルに送信データを表示
      description: 'フォーム送信時のコールバック関数',
      table: {
        type: { summary: '(data: { email: string; password: string }) => void' },
      },
    },
  },
  
  // デフォルトのargs
  args: {
    onSubmit: (data) => {
      console.log('Form submitted with:', data);
    },
  },
  
  // フォームを適切なサイズのコンテナで囲む
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default: 初期状態
 * 
 * フォームの初期表示状態を確認します。
 * - 入力フィールドが空
 * - エラーメッセージが表示されていない
 * - ボタンがクリック可能
 */
export const Default: Story = {
  args: {},
};

/**
 * FilledForm: 入力済みのフォーム
 * 
 * Play関数を使って、フォームに有効な値を入力します。
 * これにより、正常な入力時の動作を確認できます。
 */
export const FilledForm: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // フォーム要素を取得
    const emailInput = canvas.getByLabelText('メールアドレス');
    const passwordInput = canvas.getByLabelText('パスワード');
    const submitButton = canvas.getByRole('button', { name: 'ログイン' });
    
    // ステップ1: メールアドレスを入力
    await userEvent.type(emailInput, 'test@example.com');
    
    // ステップ2: パスワードを入力
    await userEvent.type(passwordInput, 'password123');
    
    // ステップ3: フォームを送信
    await userEvent.click(submitButton);
    
    // 送信データの確認（Actionsパネルで確認可能）
    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  },
};

/**
 * ValidationErrors: バリデーションエラーの表示
 * 
 * 無効な値を入力して、エラーメッセージが適切に表示されることを確認します。
 * react-hook-formのmode: 'onChange'により、入力中にリアルタイムでバリデーションが実行されます。
 */
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ステップ1: 無効なメールアドレスを入力
    const emailInput = canvas.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'invalid-email');
    
    // タブキーで次のフィールドに移動（バリデーションをトリガー）
    await userEvent.tab();
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
    
    // ステップ2: 短すぎるパスワードを入力
    const passwordInput = canvas.getByLabelText('パスワード');
    await userEvent.type(passwordInput, 'short');
    
    // タブキーで移動
    await userEvent.tab();
    
    // パスワードのエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();
    });
  },
};

/**
 * PartiallyFilled: 部分的に入力されたフォーム
 * 
 * 一部のフィールドのみ入力した状態を表示します。
 * フォームの送信ボタンをクリックすると、未入力フィールドのエラーが表示されます。
 */
export const PartiallyFilled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // メールアドレスのみ入力
    const emailInput = canvas.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'user@example.com');
    
    // フォームを送信しようとする
    const submitButton = canvas.getByRole('button', { name: 'ログイン' });
    await userEvent.click(submitButton);
    
    // パスワードフィールドのエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();
    });
  },
};

/**
 * CorrectingErrors: エラーの修正
 * 
 * エラーが表示された後、正しい値に修正する過程を表示します。
 * リアルタイムバリデーションにより、エラーが即座に消えることを確認できます。
 */
export const CorrectingErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ステップ1: 無効な値を入力
    const emailInput = canvas.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'invalid');
    await userEvent.tab();
    
    // エラーが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
    
    // ステップ2: フィールドをクリアして正しい値を入力
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'correct@example.com');
    
    // エラーが消えることを確認
    await waitFor(() => {
      expect(canvas.queryByText('有効なメールアドレスを入力してください')).not.toBeInTheDocument();
    });
  },
};

/**
 * SlowTyping: ゆっくりとした入力
 * 
 * 実際のユーザーの入力速度をシミュレートします。
 * delay オプションを使用して、より現実的な入力を再現します。
 */
export const SlowTyping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText('メールアドレス');
    const passwordInput = canvas.getByLabelText('パスワード');
    
    // ゆっくりとメールアドレスを入力（各文字間に100msの遅延）
    await userEvent.type(emailInput, 'slow.typing@example.com', {
      delay: 100,
    });
    
    // ゆっくりとパスワードを入力
    await userEvent.type(passwordInput, 'mypassword123', {
      delay: 100,
    });
  },
};

/**
 * KeyboardNavigation: キーボードナビゲーション
 * 
 * タブキーを使ったフォーム内の移動を確認します。
 * アクセシビリティの観点から重要なテストです。
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 最初のフィールドにフォーカス
    const emailInput = canvas.getByLabelText('メールアドレス');
    await userEvent.click(emailInput);
    
    // タブキーで次のフィールドに移動
    await userEvent.tab();
    
    // パスワードフィールドにフォーカスが移動したことを確認
    const passwordInput = canvas.getByLabelText('パスワード');
    expect(passwordInput).toHaveFocus();
    
    // もう一度タブキーで送信ボタンに移動
    await userEvent.tab();
    
    // 送信ボタンにフォーカスが移動したことを確認
    const submitButton = canvas.getByRole('button', { name: 'ログイン' });
    expect(submitButton).toHaveFocus();
  },
};

/**
 * SubmitWithEnter: Enterキーでの送信
 * 
 * フォーム内でEnterキーを押すことで送信できることを確認します。
 * 一般的なUXパターンのテストです。
 */
export const SubmitWithEnter: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // フォームに値を入力
    const emailInput = canvas.getByLabelText('メールアドレス');
    const passwordInput = canvas.getByLabelText('パスワード');
    
    await userEvent.type(emailInput, 'enter@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // パスワードフィールドでEnterキーを押す
    await userEvent.keyboard('{Enter}');
    
    // フォームが送信されたことを確認
    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: 'enter@example.com',
        password: 'password123',
      });
    });
  },
};

/**
 * CopyPasteScenario: コピー＆ペーストのシナリオ
 * 
 * クリップボードからの貼り付けをシミュレートします。
 * パスワードマネージャーを使用するユーザーの動作を再現します。
 */
export const CopyPasteScenario: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText('メールアドレス');
    const passwordInput = canvas.getByLabelText('パスワード');
    
    // メールアドレスを貼り付け（paste イベントをシミュレート）
    await userEvent.click(emailInput);
    await userEvent.paste('pasted.email@example.com');
    
    // パスワードを貼り付け
    await userEvent.click(passwordInput);
    await userEvent.paste('PastedPassword123!');
    
    // 値が正しく入力されたことを確認
    expect(emailInput).toHaveValue('pasted.email@example.com');
    expect(passwordInput).toHaveValue('PastedPassword123!');
  },
};

/**
 * MobileView: モバイルビュー
 * 
 * モバイル画面でのフォーム表示を確認します。
 * レスポンシブデザインのテストです。
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
};