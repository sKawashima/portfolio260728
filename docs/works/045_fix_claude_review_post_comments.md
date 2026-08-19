# 045: Claude Code Review がレビュー結果を投稿しない問題の修正

Issue: #45

## 何をしたか

`.github/workflows/claude-code-review.yml` を修正し、Claude Code Review のレビュー結果がPRへ投稿されるようにした。

- `permissions.pull-requests` を `read` → `write` に変更
- プロンプトに `--comment` を追加
- 投稿系ツールを明示許可する `claude_args.--allowedTools` を追加

## 調査

PR #43 の run 32224910763 を確認したところ、ワークフローは success なのにコメントが0件だった。

```text
"type": "result",
"subtype": "success",
"is_error": false,
"duration_ms": 19612,
"num_turns": 6,
"permission_denials_count": 1
```

- インラインレビューコメント: 0件、レビュー提出: 0件
- `Post buffered inline comments` ステップは `No buffered inline comments`
- ジョブのトークン権限は `PullRequests: read`

### 原因1（決定的）: プロンプトに `--comment` が無かった

code-review プラグインは `--comment` が渡されない限り投稿処理に進まない仕様。プラグイン本体に「If `--comment` argument was NOT provided, stop here. Do not post any GitHub comments.」と明記されている。

`--comment` なしだと findings は標準出力に出るだけで、その出力も `Running Claude Code via SDK (full output hidden for security)` によりログに残らない。結果として「レビューは完走しているのに何も出ない」状態になっていた。

### 原因2: `pull-requests` が read だった

`--comment` を足しても read 権限では投稿が 403 になる。公式の Automatic PR Code Review 例は `pull-requests: write`。ログの `permission_denials_count: 1` とも整合する。

## 判断

- **`--allowedTools` を追加した理由**: SDKの出力が `full output hidden for security` で伏せられており、どのツールが拒否されたか特定できない。公式例と同じ投稿系ツール一覧を明示許可して、原因2以外の取りこぼしも同時に潰す狙い。`Read` / `Grep` などの読み取り系はデフォルトで許可されるため列挙不要
- **`show_full_output: true` は有効にしなかった**: ログに機密が出る可能性があり、常時有効にする設定ではない。今回は原因が特定できたため見送った
- **`issues: read` は据え置き**: PRへのコメント投稿は `pull-requests` 権限の管轄なので、引き上げる必要がない
- **PR #43 とは別PRに分けた**: 関連記事機能とは無関係の変更で、レビュー基盤自体の不具合のため

## 次のステップ

- マージ後、実PRでレビューコメント（または「No issues found」サマリー）が実際に投稿されることを確認する
- CodeRabbit 側は無料枠切れでレビューがスキップされている（別件）
