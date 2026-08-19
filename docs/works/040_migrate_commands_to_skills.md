# 040: Claude CommandsをSkillに置き換える

Issue: #40

## 何をしたか

`.claude/commands/` にあった3つのカスタムコマンドを、Claude CodeのSkill形式（`.claude/skills/<name>/SKILL.md`）に移行した。

- `.claude/commands/create-pr.md` → `.claude/skills/create-pr/SKILL.md`
- `.claude/commands/handle-review.md` → `.claude/skills/handle-review/SKILL.md`
- `.claude/commands/init-branch.md` → `.claude/skills/init-branch/SKILL.md`
- 空になった `.claude/commands/` ディレクトリを削除
- `CLAUDE.md` の「/create-pr コマンド」という表記を「/create-pr スキル」に更新

## 判断

- 各SKILL.mdにはYAMLフロントマター（`name`, `description`）を付与した。`description` は本文冒頭の要約をベースに作成し、Skill一覧表示時にモデルが用途を判断できるようにした
- `handle-review` は引数（PR番号）を取るため `argument-hint: "[PR番号]"` を追加した
- 3つとも `disable-model-invocation: true` を付けた（PRレビュー指摘への対応）。いずれもブランチ切り替え・commit・push・PR作成といった副作用を伴うため、モデルによる自動起動を防ぎ、移行前のcommandsと同じ「ユーザーが明示的に呼ぶ」挙動を維持する。`ScheduleWakeup` 経由の `/handle-review` はユーザー相当のスラッシュ呼び出しなので、レビュー対応ループは引き続き機能する
- 本文の手順・ルールは既存コマンドの内容をそのまま維持し、挙動が変わらないようにした
- 呼び出し方は従来どおり `/create-pr` などのスラッシュ入力で変わらない

## 次のステップ

- 実際に `/create-pr` / `/handle-review` / `/init-branch` をSkillとして呼び出して動作確認する
