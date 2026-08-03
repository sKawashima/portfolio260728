# 015: PR時のチェック強化CI(lint + ビルド成果物検証)

Issue: #15

## 何をしたか

- `.github/workflows/ci.yml` を新規作成(`on: pull_request`)
  - **lint ジョブ**: `biome check src/`(CI では `--write` なしのチェックのみ)
  - **build ジョブ**: `pnpm build` 後、成果物の存在検証(`index.html` / `404.html` / `sitemap-index.xml` / `robots.txt` / `blog/atom.xml` / `favicon.svg` / `ogp.png` が欠けたら失敗)
- `deploy.yml` から `pull_request` トリガーを削除し、main への push 時のビルド+デプロイ専用に変更。常に true になった条件分岐(`if: github.event_name == 'push' ...`)も削除

## 判断

- PR 時のビルドは従来 `deploy.yml` の build ジョブが担っていたが、「PR 時のチェックを強化したい」という要望を受けて独立した `ci.yml` に分離した(PR での二重ビルドも回避)
- workid は Issue #15 に合わせて `015` を使用(`015_fix_code_fence_langs.md` とは作業名が異なるためファイル名は衝突しない)

## 次のステップ

- PR を立てて CI が実際に走ること(lint / build / 成果物検証)を確認する
