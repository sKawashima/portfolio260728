適切にブランチを切る
適切なグループごとに commit する
commit message は冒頭にその変更に合うemojiを入れて英語で作る
gh コマンドでPRを作成する
コマンドは1つずつ実行する
説明文は日本語で作成する
Issueからタスクを実装してCloseできる場合、PRの説明文の「なぜやるか」セクションに「Resolves #Issue番号」と記載する
保留タスクなどで新しいIssueを作成する場合は、作成前に必ず `gh issue list` 等で既存Issueと重複がないか確認する。重複があれば新規作成せず既存Issueを参照・追記する
init-branchは実行しないこと

作業ログを作成する場合、workid は `gh pr list --state all` で既存PR番号を確認して被らない3桁連番を使う。

PR作成後、`ScheduleWakeup`（delaySeconds=180）で `/handle-review <PR番号>` を予約し、レビュー対応ループを開始する。レビュー未着・再レビュー待ちなら次も約3分後に再予約し、確定（APPROVED / CHANGES_REQUESTED対応）するまで繰り返す。

テンプレ

## なぜやるか

## やったこと

## やってないこと
