# 030: 本番カスタム404の修正(ErrorDocument 追加)

Issue: #30

## 何をしたか

- `public/.htaccess` に `ErrorDocument 404 /404.html` を追加
- #8 の本番リンクチェック中に、存在しないURLでサーバー既定のエラーページが表示されることを発見(エラー内容から、サーバー側の ErrorDocument が存在しないパスを指している状態だった)

## 判断

- `/404.html` 自体は配備済み(200)だったため、`.htaccess` での明示指定のみで解決すると判断

## 次のステップ

- デプロイ後、存在しないURL(例: `/nonexistent-page-check/`)でカスタム404が表示されることを確認する
