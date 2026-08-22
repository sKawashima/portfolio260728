# 053: note の記事へのリンクを貼る

Issue: #53

## 何をしたか

note (https://note.com/_shiba) に投稿した記事を、トップの Blog リスト・`/blog/` の記事一覧(ページ送り含む)・Archives に外部リンクとして混ぜて表示するようにした。

- `src/lib/note.ts` を新規作成。note の RSS (`https://note.com/_shiba/rss`) をビルド時に取得し、`<item>` から title / link / pubDate / description / media:thumbnail を取り出す `parseNoteRss()` と、失敗時に空配列で続行する `fetchNoteArticles()` を実装
- `src/content.config.ts` に inline loader の `note` コレクションを追加(`getCollection('note')` で引ける)
- `src/lib/blog.ts` に一覧表示用の正規化型 `FeedEntry`(`kind: 'post' | 'note'`)と、ローカル記事 + note 記事を新しい順にマージする `sortedBlogFeed()` を追加。既存の `sortedBlogPosts()` は詳細ページ・タグ・カテゴリ・atom.xml 用にそのまま残した
- `src/components/ExternalMark.astro` を新規作成。「note ↗」のチップ型バッジ + スクリーンリーダー向けの「(外部サイトへ移動)」
- `PostList.astro` の props を `posts` → `entries: FeedEntry[]` に変更。note 記事は `target="_blank" rel="noopener noreferrer"` で開き、カテゴリの位置にバッジを出す
- トップ(`index.astro`)・`/blog/`・`/blog/page/[n]`・`/blog/archives/` を `sortedBlogFeed()` に切り替え。タグ・カテゴリページは `posts.map(postFeedEntry)` で従来どおりローカル記事のみ
- `.github/workflows/deploy.yml` に `schedule`(毎週月曜 09:00 JST)と `workflow_dispatch` を追加。push が無くても週1回は再ビルドして note の新着を反映する
- pnpm 11 へのアップデートに伴う設定移行も同梱: `package.json` の `pnpm.onlyBuiltDependencies` は pnpm 11 で読まれなくなったため削除し、`pnpm-workspace.yaml` の `allowBuilds` に `sharp` を移した

## 判断

- **データソースは RSS / ビルド時取得**: note の公式 API は非公開。RSS は現時点で全 17 記事(`noteCount: 17`)を返しており十分。手動で JSON を管理する案もあったが、更新忘れを避けるため自動取得にし、代わりに定期デプロイで鮮度を担保する(ユーザー確認のうえ毎日ではなく毎週)
- **依存追加なし**: XML パーサを足さず、`<item>` 単位の正規表現で必要な要素だけ抜く。CDATA / 実体参照(`&amp;` 等)の両方に対応
- **取得失敗でビルドを落とさない**: note の障害や CI のネットワーク都合でデプロイが止まるのを避けるため、失敗時は `console.warn` して note 記事なしで続行する。その回のデプロイでは note 記事が一覧から消えるが、次回の定期デプロイで戻る
- **混ぜる範囲**: トップ・一覧・Archives のみ。タグ / カテゴリ / 関連記事 / atom.xml には混ぜない(note 記事には本文もタグも無く、Issue でもタグは不要と確認済み。Archives は「できれば入れたい」とのことで対象に含めた)
- **外部リンクの表示**: 日付の横(カテゴリ位置)に「note ↗」チップを置き、`target="_blank"` で別タブ表示。トップと Archives ではタイトル末尾に同じチップを小さく付ける
- **`FeedEntry` への正規化**: コンポーネント側で `CollectionEntry<'blog'>` と `CollectionEntry<'note'>` を分岐させるより、`title / href / date / label / excerpt` に揃えた方が PostList・トップ・Archives の3箇所で同じ扱いにできるため

## 動作確認

- `pnpm build` 成功(132 ページ。一覧が 32 + 17 = 49 件になり、ページ送りが 4 → 5 ページに増加)
- 生成 HTML: トップに note 記事 2 件、`/blog/` に 6 件、Archives に 17 件(`全49記事`)が `target="_blank" rel="noopener noreferrer"` 付きで出力。タグ・カテゴリページと `atom.xml` には note のリンクなし
- `parseNoteRss()` を `node --experimental-strip-types` で単体確認: 実体参照デコード、CDATA、description からの「続きをみる」除去、不正な日付 / link 欠落の item のスキップ、末尾スラッシュ付き URL からの id 抽出を確認
- `pnpm install --frozen-lockfile` が pnpm 11.22.0 で通ること(CI の `pnpm/action-setup` は `packageManager` を参照する)
- ブラウザでの見た目確認は Chrome 拡張が localhost に到達できず未実施

## 課題・次のステップ

- note の RSS が返す件数に上限がある場合(一般に直近 25 件程度)、それより古い記事は一覧から落ちる。記事数が増えたら `note.com/api/v2/creators/_shiba/contents` のページングに切り替えるか、古い記事だけ静的リストで補う
- 抜粋(`excerpt`)は RSS の description 冒頭に依存するため、記事によっては「はじめに」程度しか出ない。必要なら `thumbnail` を使ったカード表示を検討
