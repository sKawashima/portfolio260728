import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { blogPath, excerptOf, sortedBlogPosts } from '../../lib/blog'

// 旧Hexo(hexo-generator-feed)のフィードURL /blog/atom.xml を維持する
export async function GET(context: APIContext) {
  const posts = await sortedBlogPosts()
  return rss({
    title: "sKawashima's blog",
    description: 'デザインと開発とアートの間でざくざくやってます。',
    site: new URL('/blog/', context.site ?? 'https://skawashima.com'),
    items: posts.map((post) => ({
      title: post.data.title,
      link: blogPath(post),
      pubDate: post.data.date,
      description: excerptOf(post, 200),
      categories: [post.data.category, ...post.data.tags].filter(
        (v): v is string => Boolean(v),
      ),
    })),
  })
}
