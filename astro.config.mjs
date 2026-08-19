import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import remarkCodeTitle from './src/lib/remark-code-title.mjs'
import remarkLinkCard from './src/lib/remark-link-card.mjs'

export default defineConfig({
  site: 'https://skawashima.com',
  base: '/',
  integrations: [sitemap()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          // 動的ルート([...path]等)由来のアセット名に「..」が含まれると
          // FTPサーバーのパストラバーサル対策で550エラーになるため、ハッシュのみにする
          assetFileNames: '_astro/[hash][extname]',
        },
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkCodeTitle, remarkLinkCard],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // インラインスタイルで色を焼き込まず --shiki-light / --shiki-dark のみ出力させ、
      // 配色は tokens.css 側の CSS だけで切り替える(!important 合戦を避けるため)
      defaultColor: false,
    },
  },
})
