# 059: Deploy CI に Slack 通知を追加

Issue: なし

## 何をしたか

- `.github/workflows/deploy.yml` に `../blog` リポジトリの `deploy.yml` と同等の Slack 通知を追加
  - **デプロイ開始時**: `build` ジョブの最初のステップで `Ilshidur/action-slack@master` により「`${{ github.sha }}` のデプロイを開始するよ。」を通知
  - **失敗時**: `build` / `deploy` 各ジョブの末尾に `homoluctus/slatify@master` を追加し、`@here` メンション付きで失敗を通知(ジョブ名・チャンネルを指定)
  - **デプロイ完了時**: `deploy` ジョブの最後のステップで `Ilshidur/action-slack@master` により「デプロイしたよ。お疲れ、skawashima。」を通知

## 判断

- 通知チャンネルは `../blog` と同じ `#blog` を使用(ユーザー確認済み)
- `deploy.yml` は push(main) 以外に週次 schedule と workflow_dispatch でも動くが、Slack通知は `push` トリガー時のみに限定(`if: github.event_name == 'push'`)。週次の自動リビルドで毎回通知が飛ぶノイズを避けるため(ユーザー確認済み)
- `../blog` は generate-test / lint-test / deploy の3ジョブ構成だったが、本リポジトリの `deploy.yml` は build / deploy の2ジョブ構成なので、それぞれに開始・失敗・完了通知を対応させた

## 注意(マージ前に必要な作業)

- リポジトリオーナーが Secrets `SLACK_WEBHOOK` を登録すること(未登録の場合、通知ステップ自体は失敗しても `continue-on-error` を設定していないため deploy 全体が失敗扱いになる点に注意)

## 次のステップ

- 実際に push トリガーでワークフローを実行し、Slack通知が想定どおり届くか確認
