import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

// 一覧のページネーション件数(旧Hexoの per_page: 10 を踏襲)
export const PER_PAGE = 10

// 旧HexoのパーマリンクはJST基準の年月なので、タイムゾーンを固定して導出する
export function blogYearMonth(date: Date) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  }).format(date)
  const [year, month] = formatted.split('-')
  return { year, month }
}

export function blogPath(entry: CollectionEntry<'blog'>) {
  const { year, month } = blogYearMonth(entry.data.date)
  return `/blog/${year}/${month}/${entry.id}/`
}

export async function sortedBlogPosts() {
  const posts = await getCollection('blog')
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// タグ・カテゴリ名をURLセグメントにする。
// 小文字化し、URLセグメントとして危険な文字(スペース・スラッシュ・#?%等)をハイフンへ正規化する。
// `!` はパスとして合法かつ固有名詞(例: タグ「!kie」)で使われるため保持する
export function slugifyTerm(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}!]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

// タグごとの記事数。件数降順(同数は名前順)
export function tagCounts(posts: CollectionEntry<'blog'>[]) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )
}

// カテゴリごとの記事数。件数降順(同数は名前順)
export function categoryCounts(posts: CollectionEntry<'blog'>[]) {
  const byCategory = new Map<string, { name: string; count: number }>()
  for (const post of posts) {
    const category = post.data.category
    if (!category) continue
    const slug = slugifyTerm(category)
    const current = byCategory.get(slug) ?? { name: category, count: 0 }
    current.count += 1
    byCategory.set(slug, current)
  }
  return [...byCategory.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

// 本文中のブログ内リンク。相対パス `/blog/YYYY/MM/slug/` と旧ドメインの絶対URLだけにマッチする。
// 先頭の境界でホストを検証しないと、外部サイトの同形式URL(`https://example.com/blog/2024/01/slug/`)の
// slugがローカル記事のidと衝突したときに、参照していない記事を参照扱いしてしまう。
// 画像パス(`/blog/YYYY/MM/slug/foo.png`)はスラッシュの後ろにセグメントが続くため、末尾の先読みで弾かれる
const BLOG_LINK_PATTERN =
  /(?:^|[\s("'])(?:https?:\/\/(?:www\.)?skawashima\.com)?\/blog\/\d{4}\/\d{2}\/([\w.-]+)\/?(?=[)\s"'#?]|$)/gm

// 本文中でリンクしている記事を出現順に返す(重複と自己参照は除く)
export function referencedPosts(
  entry: CollectionEntry<'blog'>,
  posts: CollectionEntry<'blog'>[],
) {
  const byId = new Map(posts.map((post) => [post.id, post]))
  const seen = new Set([entry.id])
  const referenced: CollectionEntry<'blog'>[] = []
  for (const [, id] of (entry.body ?? '').matchAll(BLOG_LINK_PATTERN)) {
    if (seen.has(id)) continue
    seen.add(id)
    const post = byId.get(id)
    if (post) referenced.push(post)
  }
  return referenced
}

// 同じタグ・カテゴリを持つ記事を関連度順に返す。
// カテゴリは粒度が粗いので、タグ一致をカテゴリ一致より重く見る。同点は新しい順
export function relatedPosts(
  entry: CollectionEntry<'blog'>,
  posts: CollectionEntry<'blog'>[],
  {
    exclude = [],
    limit = 5,
  }: { exclude?: CollectionEntry<'blog'>[]; limit?: number } = {},
) {
  const excluded = new Set([entry.id, ...exclude.map((post) => post.id)])
  const tags = new Set(entry.data.tags)
  return posts
    .filter((post) => !excluded.has(post.id))
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) => tags.has(tag)).length
      const sameCategory =
        Boolean(entry.data.category) &&
        post.data.category === entry.data.category
      return { post, score: sharedTags * 2 + (sameCategory ? 1 : 0) }
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.date.getTime() - a.post.data.date.getTime(),
    )
    .slice(0, limit)
    .map(({ post }) => post)
}

// 一覧用の抜粋。<!-- more --> より前の本文からMarkdown記法を落として先頭を返す
export function excerptOf(entry: CollectionEntry<'blog'>, length = 120) {
  const source = (entry.body ?? '').split('<!-- more -->')[0]
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length)}…` : text
}
