# 008: 旧リポジトリの整理(portfolio180104 / blog のアーカイブ化)

Issue: #8

## 何をしたか

- 事前確認
  - FTP 認証情報(`FTP_HOST` / `FTP_USER` / `FTP_PASSWORD`)が本リポジトリの GitHub Secrets に登録済みであることを確認
  - 本番の生存確認: sitemap 掲載の全130 URL が 200(旧記事 URL 含む)。`atom.xml` / `robots.txt` / `sitemap-index.xml` / `ogp.png` / `favicon.svg` も 200
- `sKawashima/portfolio180104` の README 冒頭に移行先(本リポジトリ・現行サイト)の告知を追記し、アーカイブ化
- `sKawashima/blog` の README 冒頭に同様の告知(全記事・URL 移行済みの旨)を追記し、アーカイブ化
- 両リポジトリの `isArchived: true` を確認

## 判断

- README への追記は GitHub Contents API 経由でデフォルトブランチへ直接コミットした(アーカイブ直前の告知追記のみで、PR を経る意義がないため)
- リンクチェック中に本番でカスタム404が機能していない問題を発見 → #30 として切り出し、PR #31 で対応

## 次のステップ

- 特になし(これでトラッキング Issue #6 のサブタスクは全完了)
