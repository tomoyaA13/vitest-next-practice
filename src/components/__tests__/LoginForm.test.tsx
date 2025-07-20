import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('正しい値でsubmitされること', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      // React Hook Formは (data, event) の形式で呼び出すため、最初の引数を確認
      expect(handleSubmit.mock.calls[0][0]).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('バリデーションエラーが表示されること', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const { container } = render(<LoginForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    // フォームを送信（空のフィールドで）
    await user.click(submitButton);

    // onSubmitが呼ばれていないことを確認（バリデーションエラーのため）
    expect(handleSubmit).not.toHaveBeenCalled();

    // エラーメッセージを待つ - より柔軟な方法で検索
    await waitFor(
      () => {
        // data-slot="form-message" を持つ要素を探す
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        // テキストコンテンツを確認
        const errorTexts = Array.from(errorMessages).map(el => el.textContent);
        expect(errorTexts).toContain('有効なメールアドレスを入力してください');
        expect(errorTexts).toContain('パスワードは8文字以上である必要があります');
      },
      {
        timeout: 3000,
        onTimeout: () => {
          // デバッグ用：タイムアウト時にDOMの内容を表示
          console.log('Current DOM:', container.innerHTML);
        },
      }
    );
  });

  it('無効なメールアドレスでエラーが表示されること', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const { container } = render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    // 無効なメールアドレスと有効なパスワードを入力
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);

    // onSubmitが呼ばれていないことを確認
    expect(handleSubmit).not.toHaveBeenCalled();

    await waitFor(
      () => {
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        const errorTexts = Array.from(errorMessages).map(el => el.textContent);
        expect(errorTexts).toContain('有効なメールアドレスを入力してください');
      },
      { timeout: 3000 }
    );
  });

  // デバッグ用の追加テスト
  it('フォームの初期状態を確認', () => {
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
