# 047: 全SkillをAIが自律的に呼び出せるようにする

Issue: #47

## 何をしたか

`.claude/skills/` の3スキルから `disable-model-invocation: true` を削除し、Claude が `Skill` ツールで自律的に呼び出せるようにした。あわせて各 `description` に「いつ使うか」のトリガー条件を追記した。

- `.claude/skills/create-pr/SKILL.md`
- `.claude/skills/handle-review/SKILL.md`
- `.claude/skills/init-branch/SKILL.md`

## 判断

- **`description` を書き足した理由**: 自律呼び出しの可否はモデルが `description` だけを見て判断する。従来の説明は「何をするか」に寄っていて発火条件として弱かったため、想定される依頼文言（「PRを作って」「レビュー見て」など）と、使ってはいけないタイミングを明記した
- **`init-branch` には否定条件も入れた**: 「実装途中やPR作成直前には使わない」。CLAUDE.md と `create-pr` の本文にある既存の禁止事項を description 側にも重ねて、誤発火を防ぐ
- **`create-pr` には「ユーザーからPR作成の指示がある場合にのみ使う」を明記**: ブランチ作成・commit・push という不可逆に近い副作用を伴うため、description レベルでも歯止めを残した
- **CLAUDE.md は変更しない**: 「コミット・ブランチ作成はユーザーから明示的に指示された場合のみ行う」「main への直コミット禁止」「/init-branch は作業の最初にのみ呼ぶ」はそのまま維持する。スキルが呼び出し可能になることと、実際に副作用を実行してよいかは別レイヤーであり、CLAUDE.md の制約が引き続き効く

## 経緯

`disable-model-invocation: true` は #40 のPRレビュー指摘を受けて意図的に付けたもの（`docs/works/040_migrate_commands_to_skills.md` 参照）。理由は「副作用を伴うためモデルによる自動起動を防ぐ」だった。今回はユーザー判断でこれを覆している。副作用への歯止めは上記のとおり description と CLAUDE.md の二段で担保する形に変えた。

## 次のステップ

- 実運用で誤発火（意図しないタイミングでの `init-branch` / `create-pr` 起動）が起きないか観察する。起きるようであれば description の否定条件を強めるか、`create-pr` のみ `disable-model-invocation` を戻すことを検討する
