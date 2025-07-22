/**
 * @file LoginForm.test.tsx
 * @description ログインフォームコンポーネントの単体テスト
 * React Hook Form + Zod + Shadcn UIを使用したフォームの包括的なテスト
 */

// ========== インポート ==========
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// userEvent: より実際のユーザー操作に近いイベントシミュレーション
// fireEventよりも推奨される方法（キーボード入力の遅延等を考慮）
import userEvent from '@testing-library/user-event';

import { LoginForm } from '@/components/LoginForm';

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
    // オプション1: waitForを使う場合（テストが不安定な場合）
    // await waitFor(() => {
    //   expect(handleSubmit).toHaveBeenCalled();
    // });

    // オプション2: 直接アサーション（推奨）
    // 最新のuserEventは非同期処理を待つため、通常はwaitForは不要
    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // toHaveBeenCalledWithの詳細解説：
    // React Hook Formは、onSubmitハンドラーを呼び出す際に2つの引数を渡します：
    // 第1引数: フォームデータのオブジェクト
    // 第2引数: Reactのイベントオブジェクト（SyntheticEvent）
    expect(handleSubmit).toHaveBeenCalledWith(
      // 第1引数: 期待されるフォームデータ
      {
        email: 'test@example.com',
        password: 'password123',
      },
      // 第2引数: イベントオブジェクト
      // expect.any(Object)は「任意のオブジェクト」にマッチするマッチャー
      // イベントオブジェクトの詳細な内容は重要でないため、
      // 「何らかのオブジェクトが渡されていること」だけを確認
      expect.any(Object),
    );

    // 別の検証方法（参考）：
    // 第1引数のみを検証したい場合は、以下のようにも書ける
    // expect(handleSubmit.mock.calls[0][0]).toEqual({
    //   email: 'test@example.com',
    //   password: 'password123',
    // });
  });

  /**
   * テスト2: バリデーションエラーの表示確認
   * 空のフォームを送信した時、適切なエラーメッセージが表示されることを検証
   */
  it('バリデーションエラーが表示されること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // 空のフォームを送信（バリデーションエラーを発生させる）
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // バリデーションエラーによりonSubmitは呼ばれないはず
    expect(handleSubmit).not.toHaveBeenCalled();

    // エラーメッセージの表示を確認
    // findByTextは要素が現れるまで待機するため、waitForは不要 (https://testing-library.com/docs/dom-testing-library/api-async/)
    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();
  });

  /**
   * テスト3: 特定フィールドのバリデーションエラー確認
   * メールアドレスのみが無効な場合のエラー表示を検証
   */
  it('無効なメールアドレスでエラーが表示されること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    // 無効なメールアドレスと有効なパスワードを入力
    await user.type(emailInput, 'invalid-email'); // @がない無効なメール
    await user.type(passwordInput, 'password123'); // 有効なパスワード

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // バリデーションエラーによりonSubmitは呼ばれない
    expect(handleSubmit).not.toHaveBeenCalled();

    // メールアドレスのエラーメッセージが表示されることを確認
    // findByText: 非同期クエリ - 要素が表示されるまで待機する
    // - デフォルトで1000ms（1秒）まで待機
    // - 要素が見つかるまで50msごとに再試行
    // - 要素が見つからない場合はエラーをthrow
    // - 非同期処理（バリデーション等）の後に表示される要素に使用
    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();

    // パスワードのエラーは表示されないことを確認
    // queryByText: 同期クエリ - 即座に結果を返す
    // - 要素が見つからない場合はnullを返す（エラーをthrowしない）
    // - 「要素が存在しないこと」を確認する場合に使用
    // - .not.toBeInTheDocument()と組み合わせて使用
    expect(screen.queryByText('パスワードは8文字以上である必要があります')).not.toBeInTheDocument();
  });

  /**
   * テスト4: フォームの初期状態確認
   * フォームが正しい初期状態でレンダリングされることを検証
   */
  it('フォームの初期状態を確認', () => {
    // ========== Arrange & Assert ==========
    render(<LoginForm onSubmit={vi.fn()} />);

    // フォーム要素が存在することを確認
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();

    // 初期状態ではエラーメッセージがないことを確認
    // queryByTextの典型的な使用例：要素が存在しないことを確認
    // getByTextを使うと、要素がない場合にエラーでテストが失敗してしまう
    expect(screen.queryByText('有効なメールアドレスを入力してください')).not.toBeInTheDocument();
    expect(screen.queryByText('パスワードは8文字以上である必要があります')).not.toBeInTheDocument();
  });

  /**
   * テスト5: 短いパスワードでエラーが表示されること
   * パスワードが8文字未満の場合のエラー表示を検証
   */
  it('短いパスワードでエラーが表示されること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act（実行）==========
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    // 有効なメールアドレスと短いパスワードを入力
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'pass'); // 4文字のパスワード

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);

    // ========== Assert（検証）==========
    expect(handleSubmit).not.toHaveBeenCalled();

    // パスワードのエラーメッセージが表示されることを確認
    expect(await screen.findByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();

    // メールアドレスのエラーは表示されないことを確認
    expect(screen.queryByText('有効なメールアドレスを入力してください')).not.toBeInTheDocument();
  });

  /**
   * テスト6: エラー状態からの復帰
   * エラーを修正した後、正常に送信できることを検証
   */
  it('エラーを修正した後正常に送信できること', async () => {
    // ========== Arrange（準備）==========
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    // ========== Act 1: エラーを発生させる ==========
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // 無効な入力で送信
    await user.type(emailInput, 'invalid');
    await user.type(passwordInput, 'short');
    await user.click(submitButton);

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();

    // ========== Act 2: エラーを修正 ==========
    // 入力をクリアして再入力
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // 再度送信
    await user.click(submitButton);

    // ========== Assert（検証）==========
    // エラー修正後の送信も同様に、waitForは通常不要
    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // toHaveBeenCalledWithの解説（再掲）：
    // このメソッドは、モック関数が特定の引数で呼び出されたことを検証
    expect(handleSubmit).toHaveBeenCalledWith(
      // 第1引数: フォームデータ（厳密に一致することを確認）
      {
        email: 'test@example.com',
        password: 'password123',
      },
      // 第2引数: Reactのイベントオブジェクト
      // expect.any(Object)はJest/Vitestのマッチャーで、
      // 「任意のオブジェクト型の値」を許容
      // 他のマッチャー例: expect.any(String), expect.any(Number), expect.any(Function)
      expect.any(Object),
    );

    // 補足: expect.any(Object)を使う理由
    // Reactのイベントオブジェクトは複雑で、
    // テスト毎に内容が変わる可能性があるため、
    // 「オブジェクトが渡されたこと」だけを検証するのが一般的
  });
});

/**
 * Testing Libraryのクエリメソッドの使い分け：
 *
 * 1. getBy... - 同期クエリ
 *    - 要素が見つからない場合はエラーをthrow
 *    - 「要素が必ず存在すること」を確認する場合に使用
 *    - 例: getByText, getByLabelText, getByRole
 *
 * 2. queryBy... - 同期クエリ
 *    - 要素が見つからない場合はnullを返す
 *    - 「要素が存在しないこと」を確認する場合に使用
 *    - 例: queryByText, queryByLabelText, queryByRole
 *
 * 3. findBy... - 非同期クエリ
 *    - 要素が表示されるまで待機するPromiseを返す
 *    - 非同期処理後に表示される要素に使用
 *    - 例: findByText, findByLabelText, findByRole
 *
 * 使い分けのガイドライン：
 * - 要素が既に存在する→ getBy...
 * - 要素が存在しないことを確認→ queryBy...
 * - 要素が後から表示される→ findBy...
 *
 * 使用例：
 * // 正しい使い方
 * const button = screen.getByRole('button'); // ボタンは最初から存在
 * expect(screen.queryByText('エラー')).not.toBeInTheDocument(); // エラーがないことを確認
 * expect(await screen.findByText('成功')).toBeInTheDocument(); // 非同期処理後の表示
 *
 * // 間違った使い方
 * screen.getByText('エラー'); // エラーがない場合、テストが失敗
 * await screen.findByRole('button'); // 既に存在する要素にfindByは不要
 *
 * 実際の動作の違い：
 * // findByText - 非同期で待機
 * await user.click(submitButton);
 * // バリデーションが完了してエラーが表示されるまで待つ
 * const error = await screen.findByText('エラーメッセージ');
 *
 * // queryByText - 即座にチェック
 * await user.click(submitButton);
 * // この時点ではまだエラーが表示されていない可能性がある
 * const error = screen.queryByText('エラーメッセージ'); // nullが返る
 *
 * 補足：複数要素の検索
 * - getAllBy... : 複数の要素を取得（要素がないとエラー）
 * - queryAllBy... : 複数の要素を取得（要素がないと空配列）
 * - findAllBy... : 非同期で複数の要素を取得
 */

/**
 * React Hook Form + Zodを使用したフォームテストのポイント：
 *
 * 1. userEventの使用
 *    - fireEventよりも実際のユーザー操作に近い
 *    - キーボード入力の遅延やフォーカス管理を適切に処理
 *    - v14以降は内部的に非同期処理を待機するため、waitForは通常不要
 *
 * 2. 非同期バリデーションへの対応
 *    - React Hook Formは非同期でバリデーションを実行
 *    - findByText/findByRoleなどの非同期クエリを使用
 *
 * 3. エラーメッセージの検索方法
 *    - Testing Libraryの推奨クエリメソッドを使用
 *    - findByText: 要素が表示されるまで待機
 *    - queryByText: 要素が存在しないことを確認
 *
 * 4. フォーム送信時の検証
 *    - React Hook Formは (data, event) の形式で呼び出す
 *    - toHaveBeenCalledWithを使用して正確に検証
 *    - expect.any(Object)でeventオブジェクトを柔軟に検証
 *
 * 5. expect.anyマッチャーの使用例
 *    - expect.any(Object): 任意のオブジェクト
 *    - expect.any(String): 任意の文字列
 *    - expect.any(Number): 任意の数値
 *    - expect.any(Function): 任意の関数
 *    - expect.any(Array): 任意の配列
 *    - expect.any(Date): 任意の日付オブジェクト
 *
 * 6. バリデーションモード
 *    - mode: 'onChange' でリアルタイムバリデーション
 *    - mode: 'onSubmit' で送信時のみバリデーション
 *
 * 7. デバッグテクニック
 *    - screen.debug()でレンダリング結果を確認
 *    - findByTextなどの非同期クエリは自動的にタイムアウトエラーを表示
 *
 * 8. waitForが必要なケース
 *    - API呼び出し後のUI更新を待つ場合
 *    - タイマーやディバウンス処理が含まれる場合
 *    - テストが不安定でタイミングの問題が発生する場合
 *    - 但し、通常のフォーム送信では必要ないことが多い
 */

/**
 * 追加で考慮すべきテストケース：
 *
 * - フィールドのフォーカス/ブラー時の動作
 * - パスワードの表示/非表示切り替え（実装されている場合）
 * - 送信中の状態管理（ローディング表示等）
 * - カスタムバリデーションルール
 * - 国際化対応（エラーメッセージの言語切り替え）
 * - フォームのリアルタイムバリデーション（onChangeモードの場合）
 */
