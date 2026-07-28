# 003: ブログ記事の移行(Hexo → Astro コンテンツコレクション)

Issue: #3

## 何をしたか

- 移行スクリプト `scripts/migrate-blog.mjs` を作成し、旧ブログ(`../blog`)の記事を変換
  - `source/_posts/*.md`(**32記事**)→ `src/content/blog/<slug>.md`
  - front-matter を正規化(date を ISO 8601 + JST タイムゾーン付きに。ゼロ埋めなし・秒なし表記にも対応)
  - 記事同名のアセットフォルダ(11個)→ `public/blog/<year>/<month>/<slug>/`(旧画像URLと同一パス)
  - 本文の相対画像参照を絶対パスへ書き換え
  - Hexo固有タグの変換:
    - `{% linkPreview %}` / `{% twitter %}` → 素のURL行(GFMオートリンク。#4でリンクカード化予定)
    - `{% youtube %}` → iframe埋め込み
    - `{% post_link %}` → 内部リンク(ファイル名参照・タイトル参照の両対応)
    - `{% link %}` → 通常のMarkdownリンク
- `blog` コンテンツコレクションをスキーマ定義(title / date / category / tags)
- 記事ページのルーティング `src/pages/blog/[...path].astro` を実装(基本の組版のみ。本格デザインは #4)
  - 年月はJST固定で導出(`src/lib/blog.ts`)し、CI(UTC)でもURLがずれない

## 判断

- **Issueの「53記事」は誤りで実記事は32本**(53はアセットフォルダ込みのファイル数)
- 記事に対応しないアセットフォルダ10個(未公開下書きの残骸)は移行しない
- 画像は `src/content/` に置かず `public/blog/<y>/<m>/<slug>/` に配置。旧サイトの画像URLをそのまま維持でき、Astroの画像解決エラーも回避できる
- `<!-- more -->` / `<!-- toc -->` コメントは本文にそのまま残置(#4 で抜粋・目次に活用)

## 検証

- 全32記事のビルド成功(51ページ: ポートフォリオ18 + works一覧1 + ブログ32)
- **生成した全32記事のURLを本番 `skawashima.com` と突き合わせ、全件 HTTP 200 で一致を確認**

## 課題

- textlint(ja-technical-writing)の設定移行は未実施(要検討として #4 か別Issueで判断)
- コードフェンスの言語タグに Shiki 未対応の表記が多数あり(`js:とある.vue` 等)。plaintext フォールバックで表示は可能。表示調整は #4 で検討

## 次のステップ

- #4 ブログのページ実装と読みやすさ重視のデザイン(一覧・タグ・カテゴリ・アーカイブ・RSS・リンクカード)
