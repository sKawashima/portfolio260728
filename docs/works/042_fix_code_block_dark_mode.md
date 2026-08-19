# 042: ダークモード時のコードブロック表示の修正

Issue: #42

## 何をしたか

- `astro.config.mjs` の `shikiConfig` に `defaultColor: false` を追加
- `src/styles/tokens.css` の Shiki 用スタイルを、ライト/ダーク両方を CSS 変数で当てる形に書き換え

## 原因

Shiki のデュアルテーマ(`themes: { light, dark }`)はデフォルトでライト側の色を**インラインスタイル**として焼き込む。

```text
<pre class="astro-code ..." style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8">
<span style="color:#6F42C1;--shiki-dark:#B392F0">
```

`tokens.css` のダーク用ルールは `!important` なしだったため、インラインスタイルに負けて `pre` は白背景・黒文字のまま。
一方 `span` にはインラインの `background-color` が無いので、`.astro-code span { background-color: var(--shiki-dark-bg) }` だけが適用される。
カスタムプロパティは継承するので `span` は `pre` の `--shiki-dark-bg`(#24292e)を受け取り、**トークンごとに黒背景が塗られた**。
これが Issue の「白地に文字だけ黒背景、でも文字も黒色」の状態。

副次的に、フォントスタイルは直接プロパティではなく `--shiki-light-font-style` としてのみ出力されるため、ライトモードでも italic が効いていなかった。

## 判断

- `!important` を足すだけでも直るが、インラインスタイルとの特異性合戦になり見通しが悪い。
  `defaultColor: false` にすれば出力は `--shiki-light` / `--shiki-dark` の変数のみになり、
  配色を CSS 側に一本化できるのでこちらを採用した
- 背景色は `pre`(`.astro-code`)だけに指定する。`span` にも指定すると今回と同じ
  「トークンごとに背景が塗られる」問題が再発する
- `font-style` などの変数は該当トークンにしか出力されないため、`var(--shiki-*-font-style, normal)`
  のようにフォールバックを付けた
- `defaultColor: false` は CSS が無いとコードブロックが無色になるが、`tokens.css` は
  `Layout.astro` から常に読み込まれるため問題ない

## 確認

- `pnpm build` 後、生成 HTML のインラインスタイルが CSS 変数のみになっていることを確認
- `pnpm preview` でブログ記事を表示し、`data-theme` を切り替えて計算後スタイルを確認
  - dark: `pre` 背景 `rgb(36,41,46)` / 文字 `rgb(225,228,232)` / `span` 背景 `transparent`
  - light: `pre` 背景 `rgb(255,255,255)` / 文字 `rgb(36,41,46)`

## 課題(任意)

- ライトモードでは `pre` の背景(#fff)がページ背景(#fdfcfe)とほぼ同色で、
  コードブロックの境界が見えない。Issue #42 の範囲外(ダークモードのみの報告)なので今回は触っていない
