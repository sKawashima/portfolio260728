/**
 * 素のURLだけの段落(旧Hexoの linkPreview / twitter タグ由来)をリンクカードに変換する。
 * GFMオートリンクにより「URLのみの段落」は paragraph > link(text === url) になっている。
 */
const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export default function remarkLinkCard() {
  return (tree) => walk(tree)
}

function walk(node) {
  if (!Array.isArray(node.children)) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (
      child.type === 'paragraph' &&
      child.children?.length === 1 &&
      child.children[0].type === 'link'
    ) {
      const link = child.children[0]
      const text = link.children?.[0]?.value
      if (text && text === link.url && /^https?:\/\//.test(link.url)) {
        let host = link.url
        try {
          host = new URL(link.url).hostname
        } catch {
          // URLとして不正な場合はそのまま表示する
        }
        node.children[i] = {
          type: 'html',
          value:
            `<a class="link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">` +
            `<span class="link-card-host">${escapeHtml(host)}</span>` +
            `<span class="link-card-url">${escapeHtml(link.url)}</span>` +
            `</a>`,
        }
        continue
      }
    }
    walk(child)
  }
}
