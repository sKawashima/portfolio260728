import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { blogPath, excerptOf, sortedBlogPosts } from '../../lib/blog'

// 旧Hexo(hexo-generator-feed)のフィードURL /blog/atom.xml を維持する。
// note の記事もリンク先を note.com のまま混ぜ、日付順に並べる
export async function GET(context: APIContext) {
  const [posts, notes] = await Promise.all([
    sortedBlogPosts(),
    getCollection('note'),
  ])
  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      link: blogPath(post),
      pubDate: post.data.date,
      description: excerptOf(post, 200),
      categories: [post.data.category, ...post.data.tags].filter(
        (v): v is string => Boolean(v),
      ),
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      link: note.data.url,
      pubDate: note.data.date,
      description: note.data.excerpt,
      categories: ['note'],
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

  return rss({
    title: "sKawashima's blog",
    description: 'デザインと開発とアートの間でざくざくやってます。',
    site: new URL('/blog/', context.site ?? 'https://skawashima.com'),
    items,
  })
}
