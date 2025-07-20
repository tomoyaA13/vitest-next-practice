/**
 * @file page.test.tsx
 * @description Next.jsのルートページコンポーネントのテスト
 * このファイルでは、アプリケーションのメインページが正しくレンダリングされることを確認します。
 */

// Vitestのテストユーティリティをインポート
// expect: アサーション（期待値の検証）を行うための関数
// test: 個別のテストケースを定義するための関数
import { expect, test } from 'vitest';

// React Testing Libraryのユーティリティをインポート
// render: Reactコンポーネントを仮想DOMにレンダリングする関数
// screen: レンダリングされた要素を検索するためのクエリ集
import { render, screen } from '@testing-library/react';

// テスト対象のコンポーネントをインポート
// ../app/page はNext.jsのルートページコンポーネント
import Page from '../page';

/**
 * ページコンポーネントのテストスイート
 * 基本的なレンダリングとコンテンツの存在確認を行います
 */
test('Page', () => {
  // ========== Arrange（準備）==========
  // Pageコンポーネントを仮想DOMにレンダリング
  // renderメソッドは、テスト環境でReactコンポーネントをマウントし、
  // そのコンポーネントのDOM構造を作成します
  render(<Page />);

  // ========== Act（実行）& Assert（検証）==========
  // getByRoleメソッドを使用して、特定の役割（role）を持つ要素を検索
  // 'heading': 見出し要素（h1〜h6）を検索
  // level: 1: h1要素を指定
  // name: 'Home': 見出しのテキスト内容が'Home'であることを指定
  //
  // toBeDefined(): 要素が存在する（undefinedでない）ことを確認
  // これにより、ページに「Home」というテキストを持つh1要素が
  // 正しくレンダリングされていることを検証します
  expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined();
});

/**
 * テストのベストプラクティス：
 * 1. getByRoleを使用することで、アクセシビリティを考慮したテストが可能
 * 2. セマンティックなクエリ（role, label, text）を優先的に使用
 * 3. toBeDefined()の代わりにtoBeInTheDocument()も使用可能（jest-domが必要）
 *
 * このテストが検証していること：
 * - Pageコンポーネントがエラーなくレンダリングされる
 * - ページに「Home」というh1見出しが存在する
 * - 基本的なページ構造が期待通りである
 */
