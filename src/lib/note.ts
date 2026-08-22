// note (https://note.com/_shiba) の記事を RSS から取り込む。
// 公式APIは非公開なので、公開されている RSS 2.0 フィードだけに依存する。
// XMLパーサ依存を増やさないよう、<item> 単位の素朴な正規表現で必要な要素だけ取り出す
export const NOTE_RSS_URL = 'https://note.com/_shiba/rss'

export interface NoteArticle {
  // `https://note.com/_shiba/n/nXXXX` 末尾の記事キー(`nXXXX`)。collection の id に使う
  id: string
  title: string
  url: string
  date: Date
  excerpt: string
  thumbnail?: string
}

function tagContent(source: string, tag: string) {
  const match = source.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`),
  )
  return match ? match[1] : undefined
}

function unwrapCdata(text: string) {
  return text.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
}

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

function textOf(source: string, tag: string) {
  const raw = tagContent(source, tag)
  return raw === undefined ? undefined : decodeEntities(unwrapCdata(raw)).trim()
}

// description は本文冒頭のHTML断片。タグと末尾の「続きをみる」リンクを落として抜粋にする
function excerptOf(html: string, length = 120) {
  const text = decodeEntities(
    html
      .replace(/<a[^>]*>\s*続きをみる\s*<\/a>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export function parseNoteRss(xml: string): NoteArticle[] {
  const articles: NoteArticle[] = []
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = textOf(item, 'title')
    const url = textOf(item, 'link')
    const pubDate = textOf(item, 'pubDate')
    if (!title || !url || !pubDate) continue
    const date = new Date(pubDate)
    if (Number.isNaN(date.getTime())) continue
    const id = url.split('/').filter(Boolean).at(-1)
    if (!id) continue
    articles.push({
      id,
      title,
      url,
      date,
      excerpt: excerptOf(unwrapCdata(tagContent(item, 'description') ?? '')),
      thumbnail: textOf(item, 'media:thumbnail') || undefined,
    })
  }
  return articles
}

// 取得失敗時はビルドを落とさず、note記事なしで続行する(noteの障害でデプロイを止めないため)
export async function fetchNoteArticles(url = NOTE_RSS_URL) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    const articles = parseNoteRss(await response.text())
    if (articles.length === 0) {
      console.warn(`[note] no articles parsed from ${url}`)
    }
    return articles
  } catch (error) {
    console.warn(
      `[note] failed to fetch ${url}; continuing without note articles`,
    )
    console.warn(error)
    return []
  }
}
