# GitHub Actions CI設定ガイド

## 概要

このプロジェクトでは、フロントエンドのテストを自動化するためにGitHub Actionsを使用しています。

## ワークフロー

### 1. Vitest Tests (`.github/workflows/vitest.yml`)
- **トリガー**: mainブランチへのプッシュ、プルリクエスト
- **実行内容**:
  - TypeScript型チェック
  - ESLintによるコード品質チェック
  - Vitestによる単体テスト・統合テスト
  - テストカバレッジの測定
  - Next.jsのビルドテスト

### 2. Playwright Tests (`.github/workflows/playwright.yml`)
- **トリガー**: mainブランチへのプッシュ、プルリクエスト
- **実行内容**: E2Eテストの実行

## ローカルでのテスト実行

```bash
# 単体テストの実行
pnpm test

# UIモードでテスト実行（ブラウザで結果を確認）
pnpm test:ui

# カバレッジ付きでテスト実行
pnpm test:coverage

# E2Eテストの実行
pnpm test:e2e
```

## プルリクエストでの動作

1. **自動テスト実行**: PR作成時に全てのテストが自動実行されます
2. **カバレッジレポート**: テストカバレッジがPRにコメントとして追加されます
3. **ステータスチェック**: すべてのテストが成功しないとマージできません

## テストの書き方

### 単体テスト例
```typescript
// src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### 統合テスト例
```typescript
// src/app/home/Home.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';

describe('Home Page', () => {
  it('navigates to detail page on button click', async () => {
    const user = userEvent.setup();
    render(<Home />);
    
    const button = screen.getByRole('button', { name: /詳細を見る/ });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('詳細ページ')).toBeInTheDocument();
    });
  });
});
```

## トラブルシューティング

### CIでテストが失敗する場合

1. **ローカルで再現を確認**
   ```bash
   pnpm test:coverage
   ```

2. **キャッシュをクリア**
   - GitHub Actionsの設定でキャッシュをクリアしてみる

3. **依存関係の確認**
   ```bash
   pnpm install --frozen-lockfile
   ```

### カバレッジが低い場合

1. **カバレッジレポートを確認**
   ```bash
   pnpm test:coverage
   # coverage/index.html をブラウザで開く
   ```

2. **テストされていない箇所を特定**
   - 赤くハイライトされている部分を確認
   - 必要なテストケースを追加

## ベストプラクティス

1. **テストファーストアプローチ**
   - 機能実装前にテストを書く
   - TDD（テスト駆動開発）の実践

2. **意味のあるテストを書く**
   - UIの見た目だけでなく、振る舞いをテスト
   - エッジケースも考慮

3. **テストの保守性**
   - テストコードも本番コードと同じくらい重要
   - DRY原則を適用し、共通処理は関数化

4. **CIの活用**
   - PRレビュー前にCIが通っていることを確認
   - カバレッジレポートを参考に品質を維持

## 参考リンク

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)