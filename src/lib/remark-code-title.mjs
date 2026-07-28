/**
 * コードフェンスのメタ `title="..."` をコードブロック直前のキャプションとして挿入する。
 * 例: ```shell title="実行コマンド例" → <div class="code-title">実行コマンド例</div> + コードブロック
 */
const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export default function remarkCodeTitle() {
  return (tree) => walk(tree)
}

function walk(node) {
  if (!Array.isArray(node.children)) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (child.type === 'code' && child.meta) {
      const m = child.meta.match(/title="([^"]+)"/)
      if (m) {
        node.children.splice(i, 0, {
          type: 'html',
          value: `<div class="code-title">${escapeHtml(m[1])}</div>`,
        })
        i++
      }
    } else {
      walk(child)
    }
  }
}
