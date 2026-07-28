import { defineConfig } from 'astro/config'
import remarkCodeTitle from './src/lib/remark-code-title.mjs'
import remarkLinkCard from './src/lib/remark-link-card.mjs'

export default defineConfig({
  site: 'https://skawashima.com',
  base: '/',
  markdown: {
    remarkPlugins: [remarkCodeTitle, remarkLinkCard],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
