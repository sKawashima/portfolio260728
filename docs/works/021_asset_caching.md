# 021: 静的アセットのキャッシュ戦略

Issue: #21

## 何をしたか

- `public/.htaccess` を追加(本番はApacheであることをレスポンスヘッダで確認済み)
  - webフォント(woff/woff2): 1年 + `immutable`(内容不変のため)
  - 画像(png/jpg/gif/svg/ico/webp): 1ヶ月
  - CSS/JS: 1年(Astroの `_astro/` 配下はファイル名ハッシュ付きのため安全)
  - HTML: `no-cache`(更新の即時反映を優先)
- `Layout.astro` にフォント3種の `<link rel="preload">` を追加(初回描画のチラつき軽減)

## 判断

- CDNやフォントサブセット化までは行わず、まずはHTTPキャッシュで対応(woff合計 約110KB、初回のみのロードになれば十分)
- `.htaccess` は `public/` に置き、ビルドで `dist/` にそのままコピーされることを確認。FTPデプロイのartifact設定は `include-hidden-files: true` 済み(#5)

## 検証

- `pnpm build` 130ページ成功、`dist/.htaccess` の生成を確認
- キャッシュヘッダの実効確認は本番デプロイ後(#5 マージ後)に行う

## 次のステップ

- 本番反映後、`curl -I` でフォントの `Cache-Control` ヘッダを確認
