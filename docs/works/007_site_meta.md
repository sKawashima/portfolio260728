# 007: サイトメタ整備(sitemap / 404 / OGP画像 / robots.txt)

Issue: #7

## 何をしたか

- `@astrojs/sitemap` を導入し、`astro.config.mjs` に integration を追加。ビルドで `sitemap-index.xml` / `sitemap-0.xml` が生成されることを確認(131ページ)
- `src/pages/404.astro` を新規作成。トップのヒーローと同じ意匠(eyebrow + display フォント + アクセントバー)で、トップ / Works / Blog への導線を設置
- ファビコンを案2a(バイオレット地 #8f4eb4 × 白アクセントバー)に刷新
  - `public/favicon.svg`(Issue #7 コメントの SVG)
  - sharp で `favicon-96.png` と `apple-touch-icon.png`(180px)を生成
  - 旧 SK ロゴの `favicon.ico` は削除し、`Layout.astro` の `<link>` を差し替え
- OGP デフォルト画像 `public/ogp.png`(1200×630)を sharp + SVG で生成。トップのヒーローを踏襲したフラット構成(グラデーションなし)
- `Layout.astro` に `og:site_name` / `og:image` / `twitter:card`(summary_large_image)を追加
- `public/robots.txt` を設置(sitemap-index.xml への参照付き)
- 各ページの title / description を確認。description 未指定だったトップ・Works 一覧・Works 詳細に追加

## 判断

- apple-touch-icon は iOS 側で角丸マスクされるため、角丸なしの全面塗りで生成した
- OGP 画像のフォントは再現性のためシステムサンス(Helvetica)を使用。Texta webfont は sharp(librsvg)から参照できないため
- 記事ごとの OGP 画像自動生成は今回見送り(Issue では「可能なら検討」扱い)。必要になったら別 Issue に切り出す

## 次のステップ

- デプロイ後に本番で `sitemap-index.xml` / `robots.txt` / 404 / OGP(SNS カードプレビュー)を確認
- Search Console への sitemap 登録
