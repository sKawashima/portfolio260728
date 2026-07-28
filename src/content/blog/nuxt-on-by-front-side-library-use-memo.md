---
title: "Nuxt上でフロントサイドライブラリを使うメモ"
date: "2018-10-15T17:34:09+09:00"
category: "Development"
tags: ["JavaScript", "Nuxt"]
---

> この記事はQiitaに書いていた自身の記事のコピーです。

Nuxt上でTone.jsを使いたかった。
`window is not defined`っておこられた。
ESLintはStandardを使用。

公式ガイドラインにも記述がありますが、一部ハマったりしたのでメモ程度に書いています。

<!-- more -->

---

## 目次

<!-- toc -->

## Tone.js

Web Audio APIを使いやすくするためのライブラリ。

## 対処法


```js title=".vueファイル内の読み込み"
if (process.browser) {
  var Tone = require('tone')
}
```

```js title="vueファイル内の処理"
if (process.browser) {
  console.log(Tone.Frequency('A3').toMidi())
}
```

### ポイント

- `if (process.browser)`
  - サーバーサイドで実行しない
- `require('tone')`
  - `import`はインデント上で使えないため`require`を使用する

## もやもや

やっぱり`import`に統一したい。
何かいい手を知ってる方が居たらアドバイスをお願いします。
