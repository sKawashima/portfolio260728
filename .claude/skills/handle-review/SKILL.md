---
name: handle-review
description: PRのレビューコメントを確認し、対応方針をユーザーに提示してから実装する。PR作成後のレビュー対応や、「レビュー見て」「指摘に対応して」と言われたときに使う。CodeRabbitやClaude Code Reviewの指摘の取り込み、レビュースレッドのResolveまで行う。
argument-hint: "[PR番号]"
---

PRのレビューコメントを確認し、対応方針をユーザーに提示してから実装する。

## 引数

`$ARGUMENTS` にPR番号を指定できる（例: `/handle-review 42`）。
省略した場合は現在のブランチに紐づくPRを自動検出する。

## 手順

### 1. レビューコメントの取得

以下のコマンドで情報を収集する（コマンドは1つずつ実行する）:

```bash
# owner/repo を取得
gh repo view --json nameWithOwner

# PR基本情報（タイトル・本文・状態・レビュー判定）
gh pr view <PR番号> --json number,title,body,state,reviewDecision

# ① PR全体への一般コメント（会話スレッド・PRへの返信）
gh pr view <PR番号> --json comments

# ② コード行に紐づいたインラインレビューコメント（diff上の指摘）
gh api repos/{owner}/{repo}/pulls/<PR番号>/comments

# ③ レビュー提出本体（APPROVED / CHANGES_REQUESTED / COMMENTED とそのサマリー文）
gh api repos/{owner}/{repo}/pulls/<PR番号>/reviews

# ④ レビュースレッド一覧（threadId を取得するために必須）
gh api graphql -f query='
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      reviewThreads(first:100) {
        nodes {
          id
          isResolved
          comments(first:1) {
            nodes { body path line }
          }
        }
      }
    }
  }
}' -f owner={owner} -f repo={repo} -F pr=<PR番号>
```

①〜④はそれぞれ異なる内容を持つため、すべて取得してから分類すること。
- ①: PRスレッドへの一般的な返信・質問
- ②: 特定ファイル・行への指摘（`path`, `line`, `diff_hunk` を持つ）
- ③: レビュー全体の承認状態と添付された総評コメント
- ④: スレッドのResolveに必要な `id`（GraphQL node ID）と現在の解決状態

最低限 Coderabbitai と claude によるレビューが揃っていることを確認したら次に進む。

### 2. コメントの分類

取得したすべてのレビューコメント・スレッドを精読し、各コメントを以下のいずれかに分類する:

- **要対応（コード変更）**: バグ指摘・実装修正依頼・リファクタ提案など、コードの変更が必要
- **要対応（返答のみ）**: 質問・確認・意図の説明を求めるコメントで、返答すれば十分
- **対応不要**: 承認コメント・LGTM・絵文字など、アクション不要
- **判断保留**: 意図が読み取れない、または対応方針が複数ある場合

### 3. 対応方針の提示とユーザー確認

以下の形式でまとめてユーザーに提示し、**実装前に必ず確認を取る**:

```markdown
## PRレビュー対応方針: #<PR番号> <タイトル>

### 要対応（コード変更）
- [ ] [コメント概要] → [具体的な対応内容]
  - ファイル: path/to/file.ts (行番号があれば記載)

### 要対応（返答のみ）
- [ ] [コメント概要] → [返答内容案]

### 対応不要
- [コメント概要] → スキップ

### 判断保留
- [コメント概要] → [理由・ユーザーへの質問]
```

「判断保留」がある場合はユーザーに判断を仰いでから次へ進む。
「この方針で進めますか？」と確認してから実装に移る。

### 4. 実装

ユーザーの承認を得たら、方針に従って対応する（コマンドは1つずつ実行する）:

- **コード変更**: ファイルを編集する
- **返答のみ**: `gh api repos/{owner}/{repo}/issues/<PR番号>/comments -f body="..."` でコメントを投稿する
- 実装後に `bun run check` でlintエラーがないか確認する

### 5. スレッドのResolve

対応・スキップを問わず、すべての処理済みスレッドをResolveする。

**要対応（コード変更・返答）のスレッド**: 対応が完了したらResolveする。

**対応不要と判断したスレッド**: Resolveの前に、理由をコメントとして投稿してからResolveする。

```
# 理由コメントを投稿（対応不要の場合のみ）
gh api repos/{owner}/{repo}/issues/<PR番号>/comments \
  -f body="対応不要と判断した理由を記載する"

# スレッドをResolve（threadId は手順2の④で取得したGraphQL node ID）
gh api graphql -f query='
mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread { id isResolved }
  }
}' -f threadId=<threadId>
```

スレッドIDと各コメントの対応は、手順1で取得した④の `comments.nodes[0].body` と実際のコメント内容を照合して特定すること。
既にResolve済みのスレッド（`isResolved: true`）はスキップする。

### 6. commit・push

コード変更を行った場合は、確認なしに以下を自律的に実行する:

1. 作業ログ（`docs/works/`）を更新する（workid は `gh pr list --state all` で既存PR番号を確認して被らない3桁連番を使う）
2. 変更ファイルを `git add` してコミットする（適切な絵文字付き英語メッセージ）
3. `git push` する

### 7. 完了報告

対応した内容を箇条書きでまとめて報告する。
