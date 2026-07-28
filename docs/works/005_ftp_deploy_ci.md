# 005: GitHub Actions による FTP 自動デプロイ

Issue: #5

## 何をしたか

- `.github/workflows/deploy.yml` を作成
  - **PR時**: `pnpm build` によるビルド検証のみ
  - **mainへのpush時**: ビルド → 成果物(`dist/`)を `SamKirkland/FTP-Deploy-Action@v4.3.5` でレンタルサーバーの `/skawashima.com/` へアップロード
  - pnpm + Node 22、lockfile固定インストール、setup-node の pnpm キャッシュ利用
- `README.md` を新規作成(プロジェクト概要・開発コマンド・コンテンツ追加手順・デプロイ・Secrets登録手順)

## 判断

- **FTP-Deploy-Action を採用**: 旧 `deploy.js`(ftp-deploy + .env のローカル手動実行)を置き換え。sync-state ファイル(`.ftp-deploy-sync-state.json`)による差分アップロードで、毎回全ファイルを送らない
- **サーバー上の既存ファイルは削除しない**: dangerous-clean-slate は使わず、アクションが管理していない既存ファイル(旧サイトの残置物等)には触れない
- **アップロード先はサイトルート** `/skawashima.com/`(旧ブログは `/skawashima.com/blog/` のみだったが、統合後はポートフォリオ+ブログ全体を配置)
- build ジョブと deploy ジョブを分離し、artifact 経由で受け渡し(PR時はアップロードもスキップ)

## 注意(マージ前に必要な作業)

- リポジトリオーナーが Secrets を登録すること: `FTP_HOST` / `FTP_USER` / `FTP_PASSWORD`(値は旧 blog リポジトリの `.env` と同じ。認証情報のためコミット禁止)
- 未登録のまま main にマージすると deploy ジョブが失敗する(ビルドは通る)

## 次のステップ

- 本番反映後の表示確認(旧記事URL・画像・RSS)
- #7 サイトメタ整備 / #8 旧リポジトリのアーカイブ化
