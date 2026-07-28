main ブランチに戻って最新の origin/main を pull する。

コマンドは1つずつ実行する。
- `git checkout main`
- `git pull`

uncommitted な変更がある場合はその場で止めてユーザーに確認する (`git status` で状況を伝える)。勝手に stash / discard はしない。
