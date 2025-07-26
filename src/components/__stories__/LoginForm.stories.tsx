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
 *
 * ■ TypeScriptを使用することによるStorybookでの恩恵
 *
 * 1. 【開発効率の向上】
 *    - LoginFormコンポーネントのpropsを確認するために別ファイルを開く必要がありません
 *    - onSubmitプロパティの型情報が自動補完され、引数の型も明確です
 *    - 必須プロパティ（onSubmit）を忘れるとエディタが即座に警告します
 *
 * 2. 【自動的な型推論とControlsテーブル】
 *    - LoginFormのonSubmitプロパティの型情報から、Controlsテーブルが自動生成されます
 *    - argTypesでの追加設定により、より詳細な情報も提供できます
 *
 * 3. 【ゼロ設定での利用開始】
 *    - このファイルには特別なTypeScript設定は不要で、すぐに型の恩恵を受けられます
 *
 * 4. 【Meta<typeof LoginForm>による型安全性】
 *    ```typescript
 *    const meta = { ... } satisfies Meta<typeof LoginForm>;
 *    ```
 *    - LoginFormに存在しないプロパティを指定するとエラーになります
 *    - args.onSubmitの型が自動的に推論され、play関数内でも型安全に使用できます
 *
 * 5. 【satisfies演算子による厳密な型チェック】
 *    - onSubmitが必須プロパティなので、定義を忘れるとエラーになります
 *    - play関数内でargs.onSubmitを使用する際、undefinedの可能性を考慮する必要がありません
 *    - StoryObj<typeof meta>により、metaレベルで定義したargsも考慮されます
 *
 * 6. 【play関数での型安全性】
 *    ```typescript
 *    play: async ({ canvasElement, args }) => { ... }
 *    ```
 *    - canvasElementはHTMLElement型として推論されます
 *    - argsはLoginFormのprops型を含み、args.onSubmitの型も正確です
 *    - within()、userEvent、expectなどの関数も型付けされています
 *
 * 7. 【モック関数の型情報】
 *    ```typescript
 *    onSubmit: fn((data) => { ... })
 *    ```
 *    - fn()でラップされたモック関数も型情報を保持します
 *    - toHaveBeenCalledWith()でのアサーション時も型チェックが効きます
 *    - mock.callsの型も正確で、引数の型情報にアクセスできます
 */

import type { Meta, StoryObj } from '@storybook/react';
/**
 * @storybook/testからインポートする関数の説明：
 *
 * - within: 特定の要素内で要素を検索するスコープを作成
 * - userEvent: ユーザーの操作（クリック、入力など）をシミュレート
 * - expect: テストのアサーション（期待値の確認）を行う
 * - waitFor: 非同期処理が完了するまで待機
 * - fn: モック関数（Spy）を作成する
 */
import { within, userEvent, expect, waitFor, fn } from '@storybook/test';
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
  // fn()を使ってモック関数を作成することで、
  // toHaveBeenCalledWithなどのアサーションが使用可能になります
  args: {
    onSubmit: fn((data) => {
      console.log('Form submitted with:', data);
    }),
  },

  // フォームを適切なサイズのコンテナで囲む
  // https://storybook.js.org/docs/writing-stories/decorators
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
  // argsを指定しない場合、metaのデフォルトargsが使用される
  // onSubmitはfn()でラップされたモック関数になっている
};

/**
 * FilledForm: 入力済みのフォーム
 *
 * Play関数を使って、フォームに有効な値を入力します。
 * これにより、正常な入力時の動作を確認できます。
 *
 * ■ Play関数とは？
 * Play関数は、ストーリーが画面に表示された後に自動的に実行される関数です。
 * ユーザーの操作（クリック、入力、キーボード操作など）をプログラムで再現し、
 * コンポーネントが正しく動作することを確認できます。
 *
 * Play関数の利点：
 * - 手動でテストする必要がない
 * - 常に同じ手順でテストできる
 * - 複雑な操作シナリオも自動化できる
 * - CI/CDパイプラインで自動実行可能
 *
 * ■ react-hook-formのonSubmitについて
 * react-hook-formのhandleSubmitは、2つの引数でonSubmitを呼び出します：
 * 1. フォームデータ (FormData)
 * 2. Reactのイベントオブジェクト (SyntheticBaseEvent)
 *
 * そのため、テストでは第1引数のみをチェックします。
 */
export const FilledForm: Story = {
  /**
   * play関数の引数について：
   *
   * @param canvasElement - ストーリーがレンダリングされるDOM要素
   *                       これは実際のHTMLElement（div要素）です
   * @param args - このストーリーに渡されたすべてのargs
   *               この例では、onSubmit関数が含まれています
   * @param step - ステップごとにテストを整理するための関数（オプション）
   */
  play: async ({ canvasElement, args }) => {
    /**
     * within関数について：
     *
     * within()は、Testing Libraryが提供する関数で、
     * 特定の要素内で要素を検索するためのスコープを作成します。
     *
     * なぜ必要？
     * - グローバルなdocument全体ではなく、このストーリーの範囲内だけで検索
     * - 他のストーリーやコンポーネントとの干渉を防ぐ
     * - より効率的で正確な要素の検索
     */
    const canvas = within(canvasElement);

    /**
     * 要素の取得方法について：
     *
     * Testing Libraryは、実際のユーザーが要素を見つける方法に基づいて
     * 要素を検索することを推奨しています。
     *
     * getByLabelText('メールアドレス'):
     * - <label>メールアドレス</label>に関連付けられた入力要素を検索
     * - アクセシビリティの観点からも良い方法
     *
     * getByRole('button', { name: 'ログイン' }):
     * - role="button"を持つ要素で、テキストが「ログイン」のものを検索
     * - セマンティックHTMLに基づいた検索
     */
    const emailInput = canvas.getByLabelText('メールアドレス');
    const passwordInput = canvas.getByLabelText('パスワード');
    const submitButton = canvas.getByRole('button', { name: 'ログイン' });

    /**
     * userEventについて：
     *
     * userEventは、実際のユーザーの操作を再現するためのユーティリティです。
     * fireEventよりも現実的な動作をシミュレートします。
     *
     * userEvent.type():
     * - キーボードで文字を入力する動作を再現
     * - 各文字ごとにkeydown、keypress、keyupイベントが発生
     * - フォーカス、選択、入力の一連の動作を含む
     */
    // ステップ1: メールアドレスを入力
    await userEvent.type(emailInput, 'test@example.com');

    // ステップ2: パスワードを入力
    await userEvent.type(passwordInput, 'password123');

    /**
     * userEvent.click():
     * - マウスクリックを再現
     * - hover、mousedown、focus、click、mouseupなどの
     *   実際のクリックで発生するすべてのイベントを発火
     */
    // ステップ3: フォームを送信
    await userEvent.click(submitButton);

    /**
     * waitForとexpectについて：
     *
     * waitFor():
     * - 非同期処理が完了するまで待機
     * - デフォルトで1000ms（1秒）まで待機し、50msごとに条件をチェック
     * - タイムアウトすると失敗
     *
     * expect():
     * - Jestスタイルのアサーション（期待値の確認）
     * - テストが成功したかどうかを判定
     *
     * toHaveBeenCalledWith():
     * - モック関数が特定の引数で呼ばれたことを確認
     * - args.onSubmitはStorybookが自動的にモック化している
     */
    // 送信データの確認（Actionsパネルで確認可能）
    await waitFor(() => {
      // react-hook-formは2つの引数を渡す: (data, event)
      // 第1引数のフォームデータのみをチェック
      expect(args.onSubmit).toHaveBeenCalled();
      expect(args.onSubmit.mock.calls[0][0]).toEqual({
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

    /**
     * userEvent.tab():
     * - Tabキーを押す動作を再現
     * - フォーカスを次の要素に移動
     * - フォーカスアウトイベントが発生し、バリデーションがトリガーされる
     */
    // タブキーで次のフィールドに移動（バリデーションをトリガー）
    await userEvent.tab();

    /**
     * toBeInTheDocument():
     * - 要素がDOMに存在することを確認
     * - エラーメッセージが表示されたことを検証
     */
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

    /**
     * userEvent.clear():
     * - 入力フィールドの内容をクリア
     * - Ctrl+A → Delete のような操作を再現
     */
    // ステップ2: フィールドをクリアして正しい値を入力
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'correct@example.com');

    /**
     * queryByText vs getByText:
     * - getByText: 要素が見つからない場合はエラーを投げる
     * - queryByText: 要素が見つからない場合はnullを返す
     * - エラーメッセージが消えたことを確認する場合はqueryByTextを使用
     */
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

    /**
     * userEvent.typeのdelayオプション:
     * - 各文字の入力間に遅延を追加
     * - 実際のタイピング速度を再現
     * - アニメーションやリアルタイムバリデーションの確認に有用
     */
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

    /**
     * toHaveFocus():
     * - 要素がフォーカスを持っていることを確認
     * - キーボードナビゲーションのテストに重要
     */
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

    /**
     * userEvent.keyboard():
     * - キーボードショートカットや特殊キーの入力を再現
     * - {Enter}、{Tab}、{Escape}などの特殊キーを指定可能
     * - 複数のキーの組み合わせも可能: {Ctrl>}a{/Ctrl}
     */
    // パスワードフィールドでEnterキーを押す
    await userEvent.keyboard('{Enter}');

    // フォームが送信されたことを確認
    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalled();
      expect(args.onSubmit.mock.calls[0][0]).toEqual({
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

    /**
     * userEvent.paste():
     * - クリップボードからの貼り付けを再現
     * - パスワードマネージャーやコピー＆ペーストの動作をテスト
     * - pasteイベントが発火される
     */
    // メールアドレスを貼り付け（paste イベントをシミュレート）
    await userEvent.click(emailInput);
    await userEvent.paste('pasted.email@example.com');

    // パスワードを貼り付け
    await userEvent.click(passwordInput);
    await userEvent.paste('PastedPassword123!');

    /**
     * toHaveValue():
     * - 入力フィールドの値を確認
     * - フォーム要素の値が期待通りかを検証
     */
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

/**
 * ■ Play関数のデバッグ方法
 *
 * 1. Storybookの「Interactions」タブを確認
 *    - 各ステップの実行状況が表示される
 *    - エラーが発生した場所が特定できる
 *
 * 2. ブラウザの開発者ツールを使用
 *    - console.logで中間状態を確認
 *    - ブレークポイントを設定してデバッグ
 *
 * 3. 一時的にwaitForのタイムアウトを延長
 *    await waitFor(() => {...}, { timeout: 5000 });
 *
 * ■ よくある問題と解決方法
 *
 * 1. 要素が見つからない
 *    - ラベルテキストが正確か確認
 *    - 要素がレンダリングされているか確認
 *    - 適切なクエリメソッドを使用しているか確認
 *
 * 2. タイミングの問題
 *    - waitForを使って非同期処理を待つ
 *    - userEvent.typeのdelayを調整
 *
 * 3. フォーカスの問題
 *    - 要素をクリックしてからタイプ
 *    - tabインデックスが正しく設定されているか確認
 *
 * 4. onSubmitのアサーションエラー
 *    - react-hook-formは2つの引数を渡す: (data, event)
 *    - 第1引数のみをチェック: expect(args.onSubmit.mock.calls[0][0]).toEqual({...})
 *    - または両方の引数をチェック: expect(args.onSubmit).toHaveBeenCalledWith(data, expect.anything())
 *
 * ■ react-hook-formのテストのベストプラクティス
 *
 * 1. フォームデータの検証
 *    ```typescript
 *    // 第1引数（フォームデータ）のみをチェック
 *    expect(args.onSubmit).toHaveBeenCalled();
 *    const formData = args.onSubmit.mock.calls[0][0];
 *    expect(formData).toEqual({
 *      email: 'test@example.com',
 *      password: 'password123',
 *    });
 *    ```
 *
 * 2. 呼び出し回数の検証
 *    ```typescript
 *    expect(args.onSubmit).toHaveBeenCalledTimes(1);
 *    ```
 *
 * 3. イベントオブジェクトも検証したい場合
 *    ```typescript
 *    expect(args.onSubmit).toHaveBeenCalledWith(
 *      { email: 'test@example.com', password: 'password123' },
 *      expect.objectContaining({ type: 'submit' })
 *    );
 *    ```
 */
