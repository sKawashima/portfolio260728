---
name: init-branch
description: main ブランチに戻って最新の origin/main を pull する。新しい作業に着手する最初の一手としてのみ使う（「新しい作業を始める」「Issueに着手する」など、実装を書き始める前）。実装途中やPR作成直前には使わない。
---

main ブランチに戻って最新の origin/main を pull する。

コマンドは1つずつ実行する。
- `git checkout main`
- `git pull`

uncommitted な変更がある場合はその場で止めてユーザーに確認する (`git status` で状況を伝える)。勝手に stash / discard はしない。
