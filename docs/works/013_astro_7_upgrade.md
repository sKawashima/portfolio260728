# 013: Astro 5 → 7 アップグレード

Issue: #13

## 何をしたか

- `pnpm dlx @astrojs/upgrade` 実行済みの状態(astro `^5.16.6` → `^7.1.4`)から検証を実施
- `pnpm install` + キャッシュクリア(`.astro` / `node_modules/.vite`)後、`pnpm build` で全51ページの生成成功を確認

## 検証結果

- `pnpm build`: 51ページ生成、エラー・警告なし(当時出ていた [Shiki] 言語警告は旧記事のコードフェンス記法由来の既知事項で、別PR #16 で解消)
- 生成物のサニティチェック:
  - `dist/works/index.html` に作品カード17件を確認(`grep -c '<a class="card"'`)
  - `dist/blog/2020/10/figma-color-setting/index.html` の `<h1>` に記事タイトルを確認
- 開発サーバー(`pnpm dev`)起動後、`http://localhost:4321/blog/2020/10/figma-color-setting/` が HTTP 200 を返すことを確認
- `pnpm format`(Biome)通過、修正なし

## 判断

- **コード修正は不要だった**: 既存コードはAstro 5時点で新コンテンツコレクションAPI(`glob` loader / `render()`)を使っていたため、6/7の破壊的変更に該当しなかった
- アップグレード直後に出ていた `createCollectionToGlobResultMap is not a function` エラーは、旧バージョンの起動中devサーバーとlockfileの不整合が原因。サーバー再起動で解消

## 気づき

- **Astro 7 の `astro dev` はバックグラウンド起動に対応**(`astro dev stop` / `status` / `logs` で操作)。通常は `--background` 指定時のみで、非対話シェルから起動した場合は自動的にバックグラウンド化され、JSONログが出力される(今回のケース)
- pnpm が依存の build script(esbuild / sharp / @parcel/watcher)の実行をブロックしている。実行を許可する場合は `pnpm approve-builds` で個別に承認する
- 画像最適化(`astro:assets`)を使う際は、上記の承認に加えて `sharp` を直接依存に追加する必要がある

## 次のステップ

- #4 ブログのページ実装と読みやすさ重視のデザイン(本アップグレードのマージ後に再開)
