# skawashima.com

sKawashima のポートフォリオ + ブログの統合サイト。Astro 7 の静的サイトとしてビルドし、GitHub Actions からレンタルサーバーへ FTP デプロイする。

- `/` — ポートフォリオ(ハブ)
- `/works/` — 作品・活動一覧(`src/content/works/*.md` を追加すると増える)
- `/blog/` — ブログ(`src/content/blog/*.md` を追加すると増える。記事URLは `/blog/:year/:month/:slug/`)
- `/blog/atom.xml` — RSSフィード

旧リポジトリ(portfolio180104 / blog)からの移行経緯や設計判断は `docs/works/` の作業ログと [Issue #6](https://github.com/sKawashima/portfolio260728/issues/6) を参照。

## 開発

```shell
pnpm install
pnpm dev      # 開発サーバー http://localhost:4321/
pnpm build    # dist/ に静的ビルド
pnpm format   # Biome によるlint/format
```

## コンテンツの追加

- **作品**: `src/content/works/` にMDファイルを追加(スキーマは `src/content.config.ts`)
- **ブログ記事**: `src/content/blog/` にMDファイルを追加。front-matter は `title` / `date`(ISO 8601)/ `category` / `tags`
  - コードフェンスは ```` ```lang title="キャプション" ```` でタイトル付き表示
  - URLだけの行はリンクカードとして表示される
- 記事に画像を使う場合は `public/blog/<year>/<month>/<slug>/` に配置する

## デプロイ

`main` ブランチへの push で GitHub Actions(`.github/workflows/deploy.yml`)が起動し、ビルド成果物をレンタルサーバーの `/skawashima.com/` へ FTP アップロードする。PR ではビルド検証のみ実行される。

サーバー上の既存ファイルは削除しない(差分アップロードのみ)。

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
