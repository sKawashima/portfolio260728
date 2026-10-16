# 061: RSSフィードへの note 記事の追加と導線の整備

Issue: なし

## 何をしたか

- `src/layouts/Layout.astro` の `<head>` に `<link rel="alternate" type="application/rss+xml">` を追加し、全ページからブログのフィード `/blog/atom.xml` を自動検出できるようにした
- `src/components/Footer.astro` に `/blog/atom.xml` への「RSS」リンクを追加
- `src/pages/blog/atom.xml.ts` で、ブログ記事に加えて note の記事(`note` collection)も日付順に混ぜて出力するようにした
  - リンク先は note.com のまま、`category` に `note` を付けてリーダー上で区別できるようにした

## 判断

- フィード本体は既に `src/pages/blog/atom.xml.ts` (`@astrojs/rss`) で生成されていたため新規作成はしない。旧Hexoと同じURLを維持する
- works のフィードは不要(ユーザー判断)。フィードはブログ1本のみ
- フィードが1本だけなので、自動検出リンクはブログ配下に限らず全ページに置いた
- note 記事の取り込みは #54 の仕組み(ビルド時にnoteのRSSを取得、週次で再ビルド)をそのまま使う。新着がフィードに出るのはビルドのタイミング

## 課題

- `atom.xml` という名前だが中身は RSS 2.0。旧URL互換のため名前はそのままにしている
- note を直接購読している人には同じ記事が二重に届く
