/**
 * @file Button.test.tsx
 * @description カスタムButtonコンポーネントの単体テスト
 * このファイルでは、Buttonコンポーネントの様々な機能とバリエーションをテストします。
 */

// ========== インポート ==========
// Vitestのテスト関数とユーティリティ
// describe: テストスイート（テストのグループ）を定義
// it: 個別のテストケースを定義（test()のエイリアス）
// expect: アサーション（期待値の検証）を行う
// vi: Vitestのモック機能を提供するユーティリティ
import { describe, it, expect, vi } from 'vitest';

// React Testing Libraryのユーティリティ
// render: コンポーネントをテスト用DOMにレンダリング
// screen: レンダリングされた要素を検索するためのクエリ集
// fireEvent: DOM イベントをシミュレートするユーティリティ
import { render, screen, fireEvent } from '@testing-library/react';

// テスト対象のコンポーネント
import { Button } from '@/components/Button';

/**
 * Buttonコンポーネントのテストスイート
 * 以下の観点でテストを実施：
 * 1. 基本的なレンダリング
 * 2. イベントハンドリング
 * 3. 無効化状態の動作
 * 4. スタイルバリエーション
 */

describe('Button', () => {
  /**
   * テスト1: 基本的なレンダリングの確認
   * コンポーネントが正しくDOMに描画されることを検証
   */

  it('レンダリングされること', () => {
    // ========== Arrange（準備）==========
    // Buttonコンポーネントをchildren付きでレンダリング
    render(<Button>Click me</Button>);

    // ========== Assert（検証）==========
    // getByRole: アクセシビリティロールに基づいて要素を検索
    // - 'button': button要素またはrole="button"を持つ要素を検索
    // - name: アクセシブルな名前（この場合はボタンのテキスト）で絞り込み
    // toBeInTheDocument(): jest-domのカスタムマッチャー、要素がDOMに存在することを確認
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  /**
   * テスト2: クリックイベントの動作確認
   * ボタンがクリックされた時に、onClickハンドラーが正しく呼ばれることを検証
   */

  it('クリックイベントが発火すること', () => {
    // ========== Arrange（準備）==========
    // vi.fn(): Vitestのモック関数を作成
    // モック関数は、呼び出し回数や引数を記録し、後で検証できる
    const handleClick = vi.fn();

    // onClickプロパティにモック関数を渡してレンダリング
    render(<Button onClick={handleClick}>Click me</Button>);

    // ========== Act（実行）==========
    // ボタン要素を取得
    const button = screen.getByRole('button');

    // fireEvent.click(): クリックイベントをシミュレート
    // 実際のユーザーのクリック操作を模倣
    fireEvent.click(button);

    // ========== Assert（検証）==========
    // toHaveBeenCalledTimes(1): モック関数が正確に1回呼ばれたことを確認
    // これにより、クリックイベントが正しく処理されたことを検証
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * テスト3: 無効化状態の動作確認
   * disabledプロパティが設定されている時の動作を検証
   */

  it('disabledの時はクリックできないこと', () => {
    // ========== Arrange（準備）==========
    const handleClick = vi.fn();

    // disabled属性を設定してレンダリング
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    // ========== Act（実行）==========
    const button = screen.getByRole('button');

    // 無効化されたボタンをクリック
    fireEvent.click(button);

    // ========== Assert（検証）==========
    // not.toHaveBeenCalled(): モック関数が一度も呼ばれていないことを確認
    // 無効化されたボタンはクリックイベントを発火しないことを検証
    expect(handleClick).not.toHaveBeenCalled();

    // toBeDisabled(): 要素がdisabled属性を持つことを確認
    // DOMレベルでボタンが無効化されていることを検証
    expect(button).toBeDisabled();
  });

  /**
   * テスト4: スタイルバリエーションの確認
   * variantプロパティによってCSSクラスが変わることを検証
   */
  it('variantによってスタイルが変わること', () => {
    // ========== Arrange（準備）==========
    // render関数は複数の有用な戻り値を返す
    // rerender: 同じコンポーネントを異なるpropsで再レンダリングする関数
    const { rerender } = render(<Button variant='primary'>Primary</Button>);

    // ========== Assert 1（primary variant の検証）==========
    // toHaveClass(): 要素が特定のCSSクラスを持つことを確認
    // Tailwind CSSのクラス名で、青色の背景を期待
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    // ========== Act（再レンダリング）==========
    // rerender: 同じコンポーネントツリーを新しいpropsで更新
    // これにより、コンポーネントの状態を保ちながらpropsの変更をテスト可能
    rerender(<Button variant='secondary'>Secondary</Button>);

    // ========== Assert 2（secondary variant の検証）==========
    // variantが変更された後、適切なCSSクラスが適用されることを確認
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});

/**
 * このテストファイルのベストプラクティス：
 *
 * 1. AAA パターンの使用
 *    - Arrange（準備）: テストデータとコンポーネントを準備
 *    - Act（実行）: ユーザーアクションを実行
 *    - Assert（検証）: 期待される結果を確認
 *
 * 2. セマンティックなクエリの使用
 *    - getByRole を優先的に使用（アクセシビリティ向上）
 *    - テキストやラベルでの検索も可能
 *
 * 3. モック関数の活用
 *    - vi.fn() でイベントハンドラーをモック化
 *    - 呼び出し回数や引数を検証可能
 *
 * 4. 再レンダリングのテスト
 *    - rerender関数で効率的にpropsの変更をテスト
 *
 * 5. アクセシビリティを考慮
 *    - role属性やaria属性を活用したテスト
 *    - disabled状態の適切な処理を確認
 */
