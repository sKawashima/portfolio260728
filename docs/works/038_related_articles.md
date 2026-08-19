# 038: 記事詳細ページに関連記事・参照記事を表示する

Issue: #38

## 何をしたか

記事詳細ページの本文下に「Referenced articles」「Related articles」の2セクションを追加した。

- `src/lib/blog.ts` に `referencedPosts()` / `relatedPosts()` を追加
- `src/components/RelatedPosts.astro` を新規作成
- `src/pages/blog/[...path].astro` の `getStaticPaths` で両リストを算出し、props で渡して本文と前後記事ナビの間に描画

Issue本体は「同じカテゴリまたはTagの記事を最大5件」だが、作業中に「本文内で参照している記事もリンクリストで出したい」という追加要望を受けたため、参照記事セクションも同時に実装した。

## 判断

- **関連度のスコアリング**: `タグ一致数 × 2 + カテゴリ一致 × 1`。カテゴリは `Development` に多くの記事が集中していて粒度が粗いため、より具体的なシグナルであるタグ一致を重く配点した。スコア0（何も共通しない記事）は除外し、同点は新しい順
- **参照記事の抽出**: 本文（`entry.body`）の生Markdownを正規表現 `/\/blog\/\d{4}\/\d{2}\/([\w.-]+)\/?(?=[)\s"'#?]|$)/g` で走査し、slug（= `post.id`）で記事を引く。相対パス `/blog/YYYY/MM/slug/` と旧ドメインの絶対URL `https://skawashima.com/blog/...` の両方が同じパターンで拾える
- **画像パスの除外**: `/blog/2020/05/dont-store-to-dos/example.png` のような記事フォルダ内画像を参照と誤検出しないよう、末尾に先読み `(?=[)\s"'#?]|$)` を置いてスラッシュの後ろにセグメントが続くケースを弾いた
- **重複排除**: 本文中でリンク済みの記事は関連記事側から除外（`relatedPosts` の `exclude`）。同じ記事が2セクションに並ぶのを防ぐ
- **算出場所**: `BlogTaxonomy.astro` のようにコンポーネント内で `sortedBlogPosts()` を呼ぶ手もあるが、ページ側の `getStaticPaths` が既に全記事を持っているのでそこで計算し、コンポーネントは表示に専念させた
- **配置**: 本文 → Related/Referenced → 前後記事ナビ → Blogトップへ戻る。内容ベースの回遊導線を先に置き、時系列ナビと戻りリンクをページ末尾にまとめた
- **スタイル**: 見出しは `BlogTaxonomy.astro` の `.label`、リンクカードは既存 `.post-nav-link` と同じ `--color-bg-section` に揃えた
- 該当が無いセクションは非表示、両方無ければ `<aside>` ごと出さない

## 動作確認

`pnpm build`（131ページ）が成功し、生成HTMLを確認した。

| 記事 | Referenced | Related |
| --- | --- | --- |
| spajam2019pre-why-am-i-backend | 1件 | 1件 |
| the-essence-of-personal-task-management（絶対URL参照） | 2件 | 1件 |
| github-actions-auto-release | — | 5件（上位2件がタグ `GitHub Actions` 一致、以下カテゴリ一致） |
| life-improvement-tool-2019（自記事内に画像パスあり） | 誤検出なし | 1件 |

## 次のステップ

- 記事数が増えてカテゴリ一致だけの関連が目立つようなら、スコアの重み付けや「タグ一致必須」への変更を検討する
