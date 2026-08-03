# skawashima.com

sKawashima のポートフォリオ + ブログの統合サイト。Astro 7 の静的サイトとしてビルドし、GitHub Actions からレンタルサーバーへ FTP デプロイする。

- `/` — ポートフォリオ(ハブ)
- `/works/` — 作品・活動一覧(`src/content/works/*.md` を追加すると増える)
- `/blog/` — ブログ(`src/content/blog/*.md` を追加すると増える。記事URLは `/blog/:year/:month/:slug/`)
- `/blog/atom.xml` — フィード(形式は RSS 2.0。旧サイトのフィードURL互換のためパスは `atom.xml` を維持)

旧リポジトリ(portfolio180104 / blog)からの移行経緯や設計判断は `docs/works/` の作業ログと [Issue #6](https://github.com/sKawashima/portfolio260728/issues/6) を参照。

## 開発

```shell
pnpm install
pnpm dev      # 開発サーバー http://localhost:4321/
pnpm build    # dist/ に静的ビルド
pnpm format   # Biome によるlint/format
```

## プロジェクト構成

| パス | 内容 |
|---|---|
| `src/pages/` | ルーティング(トップ / Works / Blog / 404) |
| `src/content/` | コンテンツコレクション(`works/` と `blog/` のMDファイル) |
| `src/components/` / `src/layouts/` | UIコンポーネントと共通レイアウト |
| `src/lib/` | ブログ用ユーティリティと remark プラグイン(コードタイトル / リンクカード) |
| `src/styles/tokens.css` | デザイントークン(案A「Violet Evolution」。色は必ずここ経由で参照) |
| `public/` | 静的ファイル(webフォント / ファビコン / OGP画像 / robots.txt / ブログ画像) |
| `scripts/` | 移行用ワンショットスクリプト(Hexo → Astro の記事変換) |
| `docs/works/` | 作業ログ(タスクごとの経緯・判断の記録) |

## コンテンツの追加

- **作品**: `src/content/works/` にMDファイルを追加(スキーマは `src/content.config.ts`)。front-matter は `title` / `genres` / `activity` / `memberCount` / `role` / `period` / `date` / `sortDate` / `technologies` と、任意の `thumbnail` / `youtubeId` / `link`
- **ブログ記事**: `src/content/blog/` にMDファイルを追加。front-matter は `title` / `date`(ISO 8601)/ `category` / `tags`
  - コードフェンスは ```` ```lang title="キャプション" ```` でタイトル付き表示
  - URLだけの行はリンクカードとして表示される
- 記事に画像を使う場合は `public/blog/<year>/<month>/<slug>/` に配置する

## CI

PR を作成・更新すると `.github/workflows/ci.yml` が以下を並列実行する:

- **lint**: `biome check src/`(書き換えなしのチェックのみ)
- **build**: `pnpm build` 後、成果物の存在検証(`index.html` / `404.html` / `sitemap-index.xml` / `robots.txt` / `blog/atom.xml` / `favicon.svg` / `ogp.png` が欠けたら失敗)

`astro check` による型チェックとリンク切れ検査は未導入(必要になったら検討)。

## デプロイ

`main` ブランチへの push で GitHub Actions(`.github/workflows/deploy.yml`)が起動し、ビルド成果物をレンタルサーバーの `/skawashima.com/` へ FTP アップロードする。

デプロイは sync-state による差分同期で行う。**アクションの管理外にあるサーバー上の既存ファイル(旧サイトの残置物など)は保持される**が、一度デプロイしたファイルを `dist/` から削除した場合は同期時にサーバーからも削除される。

### 必要な Secrets

リポジトリの Settings → Secrets and variables → Actions に以下を登録する(値は旧 blog リポジトリの `.env` と同じもの):

| Secret | 内容 |
|---|---|
| `FTP_HOST` | FTPサーバーのホスト名 |
| `FTP_USER` | FTPユーザー名 |
| `FTP_PASSWORD` | FTPパスワード |

CLIで登録する場合:

```shell
gh secret set FTP_HOST
gh secret set FTP_USER
gh secret set FTP_PASSWORD
```
