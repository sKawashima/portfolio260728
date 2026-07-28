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
