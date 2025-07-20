import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserList } from '../UserList';

// fetchのモック
global.fetch = vi.fn();

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ユーザー一覧が表示されること', async () => {
    const mockUsers = [
      { id: 1, name: '山田太郎', email: 'yamada@example.com' },
      { id: 2, name: '鈴木花子', email: 'suzuki@example.com' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    const { container } = render(<UserList />);

    // ローディング中はスケルトンが表示される
    // Shadcn UIのSkeletonコンポーネントはdata-slot="skeleton"を使用
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(3);

    // データ取得後はユーザー情報が表示される
    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('suzuki@example.com')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージが表示されること', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Network error')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to fetch users')).toBeInTheDocument();
    });
  });
});
