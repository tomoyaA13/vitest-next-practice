import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('openがtrueの時に表示されること', () => {
    render(<ConfirmDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} title='削除の確認' description='本当に削除しますか？' />);

    expect(screen.getByText('削除の確認')).toBeInTheDocument();
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
  });

  it('確認ボタンをクリックするとonConfirmが呼ばれること', async () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog open={true} onOpenChange={vi.fn()} onConfirm={handleConfirm} title='削除の確認' description='本当に削除しますか？' />,
    );

    const confirmButton = screen.getByRole('button', { name: '確認' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('キャンセルボタンをクリックするとダイアログが閉じること', async () => {
    const handleOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={vi.fn()}
        title='削除の確認'
        description='本当に削除しますか？'
      />,
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
