import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { fetchNoteArticles } from './lib/note'

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      genres: z.array(
        z.object({
          name: z.string(),
          type: z.enum(['web', 'proposal', 'movie', 'music', 'art', 'graphic']),
        }),
      ),
      activity: z.string(),
      memberCount: z.string(),
      role: z.string(),
      period: z.string(),
      date: z.string(),
      sortDate: z.string().transform((str) => new Date(str).getTime()),
      technologies: z.string(),
      thumbnail: image().optional(),
      youtubeId: z.string().optional(),
      link: z.string().optional(),
    }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
})

// note に投稿した記事。ビルド時に RSS を取得し、一覧・トップ・Archivesへ外部リンクとして混ぜる
const note = defineCollection({
  loader: async () => {
    const articles = await fetchNoteArticles()
    return articles.map(({ date, ...article }) => ({
      ...article,
      date: date.toISOString(),
    }))
  },
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    excerpt: z.string(),
    thumbnail: z.string().optional(),
  }),
})

export const collections = {
  works,
  blog,
  note,
}
