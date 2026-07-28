import type { CollectionEntry } from 'astro:content'

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
