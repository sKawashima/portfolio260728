# 001: Astroプロジェクト初期構築とデザイントークン定義

Issue: #1

## 何をしたか

- Astro 5 プロジェクトを scaffold(pnpm、`site: https://skawashima.com`)
- Biome 2 を導入し、旧 portfolio180104 のルール(セミコロンなし・シングルクォート)を踏襲
- デザイントークンを `src/styles/tokens.css` に定義(案A「Violet Evolution」)
  - Light / Dark 両テーマをCSSカスタムプロパティで管理
  - `prefers-color-scheme` 自動追従 + `data-theme` 属性による手動切替
- 共通 `Layout.astro`(OGP、FOUC回避のテーマ確定スクリプト、Texta系webフォント)
- `ThemeToggle.astro`(テーマ切替ボタン、localStorage 永続化)
- プレースホルダのトップページ(ヒーローのみ。本実装は #2)
- 旧リポジトリから webfont(Texta-Heavy / Texta-Thin / TextaAlt-Thin)と favicon を移設

## 判断

- **グラデーション不使用**: デザイン確認時のフィードバックに基づき、案Aモックアップにあったアクセントラインのグラデーションも単色(`--color-accent`)に変更
- **Biome の対象から `.astro` を除外**: Biome 2 の unsafe fix が Astro テンプレート内のコンポーネント使用を認識できず、import 文を「未使用」として削除してしまうため。`.astro` 内のスクリプトは Astro 本体の型チェックでカバーする
- SCSS は導入済み(`sass-embedded`)だがトークンは素のCSSカスタムプロパティで管理(テーマ切替の実行時解決が必要なため)

## 課題

- `pnpm install` 時に esbuild / sharp の build script が ignore されている(`pnpm approve-builds` 未実施)。現状ビルドは通るが、画像最適化(sharp)を使う際に対応が必要
- フォントライセンスの確認は旧サイト運用を踏襲(新規配布はしていない)

## 次のステップ

- #2 ポートフォリオの移行と新デザイン実装
- #3 ブログ記事の移行(並行可)
