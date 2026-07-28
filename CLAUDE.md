## Task Manegement Rule

一つの作業につき複数のPRに分けるべきと判断したタスクは別の担当者が見ても必要十分な情報をIssueにまとめて作成する。
必要であればサブタスクやリレーションを行いIssue同士の関係性を可視化する。

## Work Logging Rule

**作業が完了したら必ず `docs/works/` に作業ログを残すこと。**

- ファイル名: `{workid}_{作業名}.md`
- workid: 対応するIssue番号を3桁ゼロ埋めで使う (例: Issue #1 → `001`、Issue #61 → `061`)。Issueなし作業は既存ファイルと被らない連番を使う
- 作業名: スネークケースで簡潔に (例: `spike_lcu_connection`)
- 内容: 何をしたか・判断・課題（任意）・次のステップ（任意）

例: `docs/works/061_windows_support.md`

コードフェンスには言語タグを付けること。例: `ts`, `json`, `text` など。

## General Rule

**コマンドは必ず1つずつ実行する。** `&&` で連結したり並列実行しないこと。

## Issue Rule

Issueに着手する際は `gh issue edit <番号> --add-assignee @me` で自身にアサインする。

## Commit & PR Rule

適切なグループごとに commit する。
commit message は冒頭にその変更に合うemojiを入れて英語で作る。

コミット・ブランチ作成はユーザーから明示的に指示された場合のみ行う。
main への直コミット禁止。

`.claude/settings.local.json` も commit 対象に含める（権限設定をチームで共有するため）。

PRは /create-pr コマンドを参照する。

`/init-branch` は作業の最初（実装開始前）にのみ呼ぶ。実装途中や `/create-pr` 直前に呼ばないこと。
