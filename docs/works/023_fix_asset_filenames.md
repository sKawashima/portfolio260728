# 023: アセットファイル名のFTPデプロイ対応

Issue: なし(#5 のフォローアップ。初回デプロイの失敗対応)

## 何をしたか

- 初回の本番FTPデプロイが `FTPError: 550 _astro/_..DBJZzG-2.css: Not owner` で失敗
  - 動的ルート `[...path].astro` 由来のCSSアセット名に `..` が含まれ、レンタルサーバーのセキュリティフィルタ(パストラバーサル対策)に拒否されたと推定
- `astro.config.mjs` の `vite.build.rollupOptions.output.assetFileNames` を `_astro/[hash][extname]` に変更し、アセット名をハッシュのみに
- ビルドで `dist/_astro/` のファイル名に `..` が含まれないことを確認

## 次のステップ

- マージ後のdeploy再実行で本番反映を確認
