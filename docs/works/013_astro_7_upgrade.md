# 013: Astro 5 → 7 アップグレード

Issue: #13

## 何をしたか

- `pnpm dlx @astrojs/upgrade` 実行済みの状態(astro `^5.16.6` → `^7.1.4`)から検証を実施
- `pnpm install` + キャッシュクリア(`.astro` / `node_modules/.vite`)後、`pnpm build` で全51ページの生成成功を確認
- ページ内容のサニティチェック(works一覧17件、ブログ記事のレンダリング、開発サーバーでの200応答)
- Biome チェック通過

## 判断

- **コード修正は不要だった**: 既存コードはAstro 5時点で新コンテンツコレクションAPI(`glob` loader / `render()`)を使っていたため、6/7の破壊的変更に該当しなかった
- アップグレード直後に出ていた `createCollectionToGlobResultMap is not a function` エラーは、旧バージョンの起動中devサーバーとlockfileの不整合が原因。サーバー再起動で解消

## 気づき

- **Astro 7 から `astro dev` はデーモン化された**(`astro dev stop` / `status` / `logs` で操作)。シェルにJSONログが出る形式に変わった
- `pnpm install` の build scripts ignore(esbuild / sharp / @parcel/watcher)は継続。sharp利用時に `pnpm approve-builds` が必要

## 次のステップ

- #4 ブログのページ実装と読みやすさ重視のデザイン(本アップグレードのマージ後に再開)
