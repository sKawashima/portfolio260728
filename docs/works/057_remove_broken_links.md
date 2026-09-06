# リンク切れになっているリンクを消す

Issue #57 の対応。

## やったこと

`src/content/` 配下の全URL（ユニーク88件）・内部リンク・画像パス・YouTube埋め込みを実際にリクエストして生存確認し、死んでいるものを削除または差し替えた。

### 差し替えたもの（正しいリンク先が現存していた）

| ファイル | 変更前 | 変更後 |
| --- | --- | --- |
| `works/pinky.md` | `http://skawashima.com/blog/2018/10/29/二度目の…/` (404) | `/blog/2018/10/jphacks2018-hackathon-is-a-sports/` |
| `blog/github-actions-text-concat.md` | `help.github.com/ja/actions/reference/context-and-expression-syntax-for-github-actions` (404) | `docs.github.com/ja/actions/reference/contexts-reference` |
| `blog/life-improvement-tool-2019.md` | `slack.com/apps/A8GBNUWU8-github` (404) | `slack.com/marketplace/A01BP7R4KNY-github` |
| `blog/behavioral-principles-for-engineering-managers.md` | `rework.withgoogle.com/intl/en/guides/managers-research-behind-great-managers` × 3 | Project Oxygen / AIプロンプト例 → `intl/jp/guides/managers-research-behind-great-managers`、Project Aristotle → `intl/jp/guides/understanding-team-effectiveness` |
| `blog/designer-develop.md` | `spajam.jp/2019/final/result/` | `history.spajam.jp/2019/final/result/` |
| `blog/spajam2019pre-why-am-i-backend.md` | `spajam.jp/2019/entry/tokyo-b/` | `history.spajam.jp/2019/entry/tokyo-b/` |

### 削除したもの（復活の見込みなし）

| ファイル | URL | 状態 | 消し方 |
| --- | --- | --- | --- |
| `works/soracamera.md` | `http://soracamera.com/` | DNS消滅 (NXDOMAIN) | `link:` 行を削除 |
| `works/hakodate-mirai-project-pre.md` | `hakodate-miraiproject.jp/pre-comming/` | 404 | `link:` 行を削除 |
| `works/fusen-no-mori.md` | `hakodate-miraiproject.jp/wp_test/baloon/` | 404 | `link:` 行を削除 |
| `blog/tokt_1-night-development.md` | `neos21.hatenablog.com/entry/2017/11/01/080000` | 404 | 「この記事に出会っていなければ…」は文ごと削除 |
| `blog/use-simplemde-in-npm.md` | `unitopi.com/markdown-editor/` | 接続拒否（サーバ停止） | リンクを外し本文は残す |
| `blog/designer-develop.md` | Zaimトレンドの `link-preview` ブロック | サービス消滅・OGP画像も壊れ | `<div>` と「覗いてみてください」の文を削除 |

## 判断

- **差し替え優先**: 出典としての情報価値が残るものは削除せず現行URLへ。特に `works/pinky.md` は旧ドメインの絶対URLで自サイトの記事を指していたので、内部リンク `/blog/YYYY/MM/{id}/` に直した。
- **文章は改変しない**: 過去記事の本文は当時の記録なので、原則リンク記法だけ外してテキストは残す。ただし指示語や誘導文のようにリンクが無いと成り立たない文は、文ごと削除した。
- **Project Aristotle の出典ミス修正**: `behavioral-principles-for-engineering-managers.md` は3か所で同一URLを別々の主張の出典にしていた。Project Aristotle はチームの効果性のガイドが正しいので、リンク切れ修正のついでに正した。
- **SPAJAM はアーカイブへ**: `spajam.jp` は Nuxt の SPA で存在しないパスも 200 を返し、配信JSバンドルの route 定義に `/2019/` 系が無いため本体サイトからは消えている。過去大会は `history.spajam.jp` に移されており、`final/result`（最優秀賞「RAISE UP」）・`entry/tokyo-b`（東京B予選・6/8〜9・ドワンゴ会場）とも記事の記述と一致する内容が残っていたので差し替えた。こちらも存在しないパスは Nuxt のローディングシェルを返すため、実コンテンツが返ることを確認している。
- **リンクを外すと成り立たない文は文ごと削除**: `tokt_1-night-development.md` の「この記事に出会っていなければ完成していたかどうか…。」は指示語の指す先が消えるため削除。`designer-develop.md` の「興味がある方は是非覗いてみてください（圧倒的宣伝）。」も誘導先が消滅しているため削除した。
- **re:Work の判定根拠**: `intl/en/` はHTTP 200を返すがタイトルが `404` のソフト404。`intl/jp/` に同一ガイドが現存する。

## 触らなかったもの

- 生存を確認: `hakolab.co.jp` / `funifd.com` / `trinity-trio.github.io` / `miraibase.jp` / `skawashima.com/temp/funtousic/` / Google Photosアルバム、YouTube埋め込み5件（oEmbed 200）、ツイート4件（publish.twitter.com/oembed 200）、内部リンク・`public/blog/` 配下の画像パス全件。
- 403だがページは存在: DOI 2件（`dl.acm.org` / `journals.sagepub.com` はCloudflareのbot遮断。`doi.org` 経由で当該URLに解決することを確認）、`npmjs.com`（registry APIで200）。
- `parcel-by-pwa-convert-fastest-of-method.md` の `play.google.com/...`（404）は `manifest.json` のサンプルコードブロック内なのでリンクではない。そのまま。
- リダイレクトはするが到達先が妥当なもの: `now.sh` → Vercel、`scrapbox.io` → Cosense、`api.slack.com/events` → docs.slack.dev、`2018.jphacks.com` → jphacks.com、`adobe.com/jp/products/xd.html` → helpx のサポートページ。

## 課題

- `medium.com/medialesson/github-actions-locally-with-act-…` は Medium が bot を一律403で弾くため機械的に検証できなかった。Medium の記事URLは通常永続するため生存と推定して残した。
- `atomic.io` は当時のプロトタイピングツールではなく別会社（In-App Messaging Platform）が同ドメインを使っている。404ではないので今回は残したが、厳密には指している対象が消えている。

## 次のステップ

- リンク切れは今後も増えるので、CIで定期的にリンクチェックを回す仕組みがあるとよい（別Issue候補）。
