# 045: Claude Code Review がレビュー結果を投稿しない問題の修正

Issue: #45
PR: #46 → #49 → #50 → #51

## 何をしたか

`.github/workflows/claude-code-review.yml` を修正し、Claude Code Review がPRへレビューを投稿するようにした。原因が3層に重なっていたため、4本のPRに分けて段階的に潰した。

| PR | 変更 | 結果 |
| --- | --- | --- |
| #46 | `pull-requests` を read → write、プロンプトに `--comment` 追加、予防的に `--allowedTools` 追加 | 前進したが未投稿 |
| #49 | `--allowedTools` を削除、診断用に `show_full_output: true` を追加 | 真因判明。`--allowedTools` は犯人ではなかった |
| #50 | `--allowedTools "Skill,..."` で `Skill` を明示許可 | プラグインが起動するようになった。まだ未投稿 |
| #51 | `--append-system-prompt` 追加、`TaskOutput`/`TaskList`/`node` を許可、`show_full_output` 削除 | 投稿成功 |

## 原因（3つ重なっていた）

### 1. プロンプトに `--comment` が無かった

code-review プラグインは `--comment` が渡されない限り投稿処理に進まない。プラグイン本体に「If `--comment` argument was NOT provided, stop here. Do not post any GitHub comments.」と明記されている。findings は標準出力に出るだけで、その出力も `Running Claude Code via SDK (full output hidden for security)` によりログに残らない。

### 2. `pull-requests` が read だった

`--comment` を足しても read 権限では投稿が 403 になる。公式の Automatic PR Code Review 例は `pull-requests: write`。

### 3. `Skill` ツールが拒否されていた（真因）

`show_full_output: true` を main に乗せて初めて見えた。

```json
"permission_denials": [
  { "tool_name": "Skill", "tool_input": { "skill": "code-review:code-review", ... } }
],
"non_execution_kind": "user-rejected"
```

`permissionMode` は `default` で、`Skill` は明示許可が必要なツール。許可が無いため `/code-review:code-review` が一度も起動せず、Claude が自前で中途半端な調査をして終了していた。実行時間88秒・$0.76 という数字はプラグインの仕事ではなく、この自前調査だった。

### 4. バックグラウンドエージェント待ちでセッションが終了していた

`Skill` を許可した後の症状。プラグインは7体のレビューエージェントをバックグラウンドで起動するが、メインのモデルが「完了通知を待つ」と言ってターンを終えてしまう。headless ではツール呼び出しなしに返答した時点でセッションが終わるため、レビューごと破棄されていた。

```text
"result": "Still running — I'll wait for the completion notifications rather than poll further."
```

`--append-system-prompt` で「headless なので通知は来ない。`TaskOutput` でポーリングし、投稿し終えるまでターンを終えるな」と明示して解決した。

## 判断

- **`--allowedTools` は追加ではなく厳格なホワイトリスト**。#46 で予防的に4つだけ列挙したところ、`Skill` が漏れて新たなブロック要因になった。プラグインが使うツールは漏れなく列挙する必要がある
- **`Bash(node:*)` を許可した**。許可前は、レビュアーが正規表現を実データで実行して検証しようとして弾かれ、手動トレースに留まっていた。裏取りの質が上がる。ただし untrusted な PR 内容に対する任意コード実行を許すことになるため、外部PRを受け付ける構成に変わったら再検討する
- **`bypassPermissions` は採らなかった**。PR本文への prompt injection で任意の bash が走り得る。必要なものだけを明示許可する形を維持した
- **`show_full_output: true` は診断専用**として入れ、投稿確認後に削除した。public リポジトリなので実行内容がログに出る設定を残さない
- **プラグイン方式（A）を自前プロンプト方式（B）より優先した**。下記の比較参照

## 検証: act によるローカル実行

ワークフロー変更は**そのPR自身では検証できない**。claude-code-action は「ワークフローファイルが default branch と一致すること」を実行条件にしており、一致しないと以下で実行ごとスキップされる。

```text
Skipping action due to workflow validation: Workflow validation failed.
The workflow file must exist and have identical content to the version on the
repository's default branch.
```

そこで act でローカル実行した。成立させるためのポイント:

- **`github_token` 入力にPATを直接渡す** — OIDC 交換が起きなくなり、上記のワークフロー検証をすり抜けられる。これがマージ前検証の鍵
- **`--actor sKawashima`** — act の既定 actor `nektos/act` は write 権限チェックに落ちる
- **`gh` を自前で入れる** — `catthehacker/ubuntu:act-latest` には入っていない（本番ランナーには標準搭載）
- **同時実行しない** — コンテナ名がワークフロー名＋ジョブ名から決まるため、並行実行すると `RWLayer of container ... is unexpectedly nil` で互いを壊す
- 末尾の `Post Install Bun` が `exitcode 127` で落ちるが、act 固有のアーティファクトで無視してよい

act は「バックグラウンドエージェント待ちで終了する」症状を実CIと同じように再現できた。忠実度の限界（PATとAppトークンの差、OIDC不在、ランナーイメージ差）はあるが、この種の問題の反復検証には十分使える。

## 比較: A（プラグイン）vs B（自前プロンプト）

| | A: プラグイン ＋ ターン終了禁止指示 | B: 公式例の自前プロンプト |
| --- | --- | --- |
| 投稿 | 成功 | 成功 |
| ターン / コスト / 所要 | 20 / $1.70 / 5分26秒 | 17 / $0.54 / 3分03秒 |
| レビューエージェント | 4体（CLAUDE.md準拠×2、バグ/セキュリティ×2） | 1体 |
| 誤検知の抑制 | あり。CLAUDE.md違反の指摘を検証段階が `VERDICT: NOT CONFIRMED` で棄却 | なし |

A は `matchAll` が RegExp を内部クローンする点を根拠付きで確認し、画像パス除外の lookahead を実データでバックトラッキング経路まで検証し、CodeRabbit の指摘（正規表現が外部ドメインにもマッチする）を独立に2体で検証して「slug は照合キーにしか使われず href は `blogPath()` 由来なので実害なし」と結論づけた。コストは約3倍だが、この深さの差を取ってAを採用した。

## 次のステップ

- A から出た実装改善提案を #43 に取り込むか検討する: `BLOG_LINK_PATTERN` に `(?:https?:\/\/skawashima\.com)?` を前置して相対パスと旧ドメインに限定する。現コーパスでは問題は起きないが、将来サードパーティの `/blog/YYYY/MM/<slug>/` URL が local post id と衝突すると誤って参照扱いになる
- PR #43 に残っている act 検証時のテストコメント2件を削除する
- CodeRabbit は無料枠切れでレビューがスキップされることがある（別件）
