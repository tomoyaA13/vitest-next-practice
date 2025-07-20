/**
 * @file LoginForm.test.tsx
 * @description ログインフォームコンポーネントの単体テスト
 * React Hook Form + Zod + Shadcn UIを使用したフォームの包括的なテスト
 */

// ========== インポート ==========
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// userEvent: より実際のユーザー操作に近いイベントシミュレーション
// fireEventよりも推奨される方法（キーボード入力の遅延等を考慮）
import userEvent from '@testing-library/user-event';

import { LoginForm } from '../LoginForm';

/**
 * LoginFormコンポーネントのテストスイート
 * 
 * テスト対象の機能：
 * - フォームの送信処理
 * - バリデーションエラーの表示
 * - 各種入力パターンでの動作
 */
describe('LoginForm', () => {
  /**
   * テスト1: 正常なフォーム送信の確認
   * 有効な値を入力してフォームを送信した時の動作を検証
   */
  it('正しい値でsubmitされること', async () => {
    // ========== Arrange（準備）==========
    // userEvent.setup(): userEventのインスタンスを作成
    // これにより、より実際のユーザー操作に近いイベントを発火できる
    const user = userEvent.setup();
    
    // フォーム送信時のハンドラーをモック化
    const handleSubmit = vi.fn();
    
    // フォームをレンダリング
    render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    // フォーム要素を取得
    // getByLabelText: ラベルテキストに関連付けられた入力要素を取得
    // アクセシビリティに優れたクエリ方法
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // ユーザー操作をシミュレート
    // user.type: 実際のキーボード入力をシミュレート（1文字ずつ入力）
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // フォームを送信
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // React Hook Formの非同期バリデーションを待つ
    await waitFor(() => {
      // モック関数が呼ばれたことを確認
      expect(handleSubmit).toHaveBeenCalled();
      
      // React Hook Formは内部的に (data, event) の形式で
      // onSubmitハンドラーを呼び出すため、最初の引数のみを検証
      expect(handleSubmit.mock.calls[0][0]).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  /**
   * テスト2: バリデーションエラーの表示確認
   * 空のフォームを送信した時、適切なエラーメッセージが表示されることを検証
   */
  it('バリデーションエラーが表示されること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    
    // containerを取得：data-slot属性など、特殊な属性でクエリする場合に使用
    const { container } = render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    // 空のフォームを送信（バリデーションエラーを発生させる）
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // バリデーションエラーによりonSubmitは呼ばれないはず
    expect(handleSubmit).not.toHaveBeenCalled();

    // エラーメッセージの表示を確認
    // Shadcn UIのFormMessageコンポーネントは
    // data-slot="form-message"属性を持つ要素としてレンダリングされる
    await waitFor(
      () => {
        // querySelectorAllでエラーメッセージ要素を検索
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        
        // エラーメッセージが存在することを確認
        expect(errorMessages.length).toBeGreaterThan(0);
        
        // エラーメッセージのテキスト内容を配列に変換
        const errorTexts = Array.from(errorMessages).map(el => el.textContent);
        
        // 期待されるエラーメッセージが含まれていることを確認
        expect(errorTexts).toContain('有効なメールアドレスを入力してください');
        expect(errorTexts).toContain('パスワードは8文字以上である必要があります');
      },
      {
        // タイムアウト設定：3秒以内にエラーが表示されることを期待
        timeout: 3000,
        // デバッグ用：タイムアウト時にDOMの内容を出力
        onTimeout: () => {
          console.log('Current DOM:', container.innerHTML);
        },
      }
    );
  });

  /**
   * テスト3: 特定フィールドのバリデーションエラー確認
   * メールアドレスのみが無効な場合のエラー表示を検証
   */
  it('無効なメールアドレスでエラーが表示されること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const { container } = render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    // 無効なメールアドレスと有効なパスワードを入力
    await user.type(emailInput, 'invalid-email');      // @がない無効なメール
    await user.type(passwordInput, 'password123');     // 有効なパスワード

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // バリデーションエラーによりonSubmitは呼ばれない
    expect(handleSubmit).not.toHaveBeenCalled();

    // メールアドレスのエラーメッセージのみが表示されることを確認
    await waitFor(
      () => {
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        const errorTexts = Array.from(errorMessages).map(el => el.textContent);
        // メールアドレスのエラーは表示される
        expect(errorTexts).toContain('有効なメールアドレスを入力してください');
      },
      { timeout: 3000 }
    );
  });

  /**
   * テスト4: フォームの初期状態確認
   * フォームが正しい初期状態でレンダリングされることを検証
   */
  it('フォームの初期状態を確認', () => {
    // ========== Arrange & Assert ==========
    const { container } = render(<LoginForm onSubmit={vi.fn()} />);
    
    // フォーム要素が存在することを確認
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    
    // 初期状態ではエラーメッセージがないことを確認
    const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
    expect(errorMessages.length).toBe(0);
  });
});

/**
 * React Hook Form + Zodを使用したフォームテストのポイント：
 * 
 * 1. userEventの使用
 *    - fireEventよりも実際のユーザー操作に近い
 *    - キーボード入力の遅延やフォーカス管理を適切に処理
 * 
 * 2. 非同期バリデーションへの対応
 *    - React Hook Formは非同期でバリデーションを実行
 *    - waitForを使用して結果を待つ必要がある
 * 
 * 3. エラーメッセージの検索方法
 *    - Shadcn UIのFormMessageコンポーネントの実装を理解
 *    - data-slot属性を使用したクエリ
 * 
 * 4. フォーム送信時の引数
 *    - React Hook Formは (data, event) の形式で呼び出す
 *    - 最初の引数（data）のみを検証
 * 
 * 5. バリデーションモード
 *    - mode: 'onChange' でリアルタイムバリデーション
 *    - mode: 'onSubmit' で送信時のみバリデーション
 * 
 * 6. デバッグテクニック
 *    - waitForのonTimeoutでDOM内容を出力
 *    - screen.debug()でレンダリング結果を確認
 */

/**
 * 追加で考慮すべきテストケース：
 * 
 * - フィールドのフォーカス/ブラー時の動作
 * - パスワードの表示/非表示切り替え（実装されている場合）
 * - エラー状態からの復帰（エラー修正後の再送信）
 * - 送信中の状態管理（ローディング表示等）
 * - カスタムバリデーションルール
 * - 国際化対応（エラーメッセージの言語切り替え）
 */
