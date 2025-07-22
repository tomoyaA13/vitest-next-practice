/**
 * @file ConfirmDialog.test.tsx
 * @description 確認ダイアログコンポーネントの単体テスト
 * Shadcn UIのAlertDialogコンポーネントを使用したカスタムダイアログのテスト
 */

// ========== インポート ==========
// Vitestのテスト関数とモック機能
import { describe, it, expect, vi } from 'vitest';

// React Testing Libraryのユーティリティ
// waitFor: 非同期的な変更を待つためのユーティリティ（ダイアログのアニメーション等）
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// テスト対象のコンポーネント
import { ConfirmDialog } from '@/components/ConfirmDialog';

/**
 * ConfirmDialogコンポーネントのテストスイート
 *
 * このコンポーネントは以下の機能を持つ：
 * - 開閉状態の管理（open prop）
 * - 確認・キャンセルのアクション
 * - カスタマイズ可能なタイトルと説明文
 */

describe('ConfirmDialog', () => {
  /**
   * テスト1: ダイアログの表示確認
   * openプロパティがtrueの時、ダイアログが表示されることを検証
   */

  it('openがtrueの時に表示されること', () => {
    // ========== Arrange（準備）==========
    // ダイアログに必要な全てのpropsを設定してレンダリング
    render(
      <ConfirmDialog
        open={true} // ダイアログを開いた状態に
        onOpenChange={vi.fn()} // 開閉状態変更のハンドラー（モック）
        onConfirm={vi.fn()} // 確認ボタンのハンドラー（モック）
        title='削除の確認' // ダイアログのタイトル
        description='本当に削除しますか？' // ダイアログの説明文
      />,
    );

    // ========== Assert（検証）==========
    // getByText: 指定されたテキストを持つ要素を検索
    // ダイアログ内のタイトルと説明文が両方表示されていることを確認
    expect(screen.getByText('削除の確認')).toBeInTheDocument();
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
  });

  /**
   * テスト2: 確認ボタンの動作確認
   * 確認ボタンをクリックした時、onConfirmハンドラーが呼ばれることを検証
   */

  it('確認ボタンをクリックするとonConfirmが呼ばれること', async () => {
    // ========== Arrange（準備）==========
    // onConfirmハンドラーをモック化
    const handleConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={handleConfirm} // モック関数を渡す
        title='削除の確認'
        description='本当に削除しますか？'
      />,
    );

    // ========== Act（実行）==========
    // 「確認」ボタンを取得してクリック
    const confirmButton = screen.getByRole('button', { name: '確認' });
    fireEvent.click(confirmButton);

    // ========== Assert（検証）==========
    // waitFor: 非同期的な更新を待つ
    // Shadcn UIのダイアログはアニメーションを含むため、
    // クリック後の処理が完了するまで待つ必要がある
    await waitFor(() => {
      // handleConfirmが正確に1回呼ばれたことを確認
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * テスト3: キャンセルボタンの動作確認
   * キャンセルボタンをクリックした時、ダイアログが閉じる処理が呼ばれることを検証
   */
  it('キャンセルボタンをクリックするとダイアログが閉じること', async () => {
    // ========== Arrange（準備）==========
    // onOpenChangeハンドラーをモック化
    // このハンドラーは開閉状態の変更時に呼ばれる
    const handleOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={vi.fn()}
        title={'削除の確認'}
        description={'本当に削除しますか?'}
      />,
    );

    // ========== Act（実行）==========
    // 「キャンセル」ボタンを取得してクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);
    // ========== Assert（検証）==========
    // 非同期処理の完了を待つ
    await waitFor(() => {
      // onOpenChangeがfalseを引数に呼ばれたことを確認
      // false = ダイアログを閉じる
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

/**
 * Shadcn UIコンポーネントをテストする際のポイント：
 *
 * 1. 非同期処理への対応
 *    - Radix UIベースのコンポーネントはアニメーションを含む
 *    - waitForを使用して状態変更を待つ
 *
 * 2. data-slot属性の活用
 *    - Shadcn UIのコンポーネントは内部でdata-slot属性を使用
 *    - 必要に応じてこれらの属性でクエリすることも可能
 *
 * 3. アクセシビリティ
 *    - AlertDialogは適切なARIA属性を持つ
 *    - role="button"などでクエリ可能
 *
 * 4. 状態管理のテスト
 *    - open/onOpenChangeパターンでの制御
 *    - 親コンポーネントでの状態管理を想定
 *
 * 5. イベントハンドラーのモック
 *    - vi.fn()で全てのコールバックをモック化
 *    - 呼び出し回数と引数を検証
 */

/**
 * 追加で考慮すべきテストケース：
 *
 * - openがfalseの時にダイアログが表示されないこと
 * - ESCキーでダイアログが閉じること
 * - オーバーレイクリックでダイアログが閉じること
 * - フォーカストラップが正しく機能すること
 * - 異なるコンテンツでの表示確認
 */
