import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

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

const about = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
    lead: z.string().optional(),
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

export const collections = {
  works,
  blog,
  about,
}
