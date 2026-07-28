/*
 * Hexo (../blog) の記事を Astro コンテンツコレクションへ移行するスクリプト。
 *
 * - source/_posts/*.md → src/content/blog/<slug>.md
 * - 記事と同名のアセットフォルダ → public/blog/<year>/<month>/<slug>/
 *   (旧URL /blog/:year/:month/:title/<image> を維持するため。本文の相対参照はそのまま解決される)
 * - Hexo固有タグを変換:
 *   {% linkPreview URL %} / {% twitter URL %} → 素のURL行(GFMオートリンク)
 *   {% youtube ID %}                          → iframe埋め込み
 *   {% link text url ... %}                   → [text](url)
 *   {% post_link ref label %}                 → [label](/blog/y/m/slug/) refはファイル名またはタイトル
 *
 * 実行: node scripts/migrate-blog.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, join } from 'node:path'

const SRC = new URL('../../blog/source/_posts', import.meta.url).pathname
const DEST = new URL('../src/content/blog', import.meta.url).pathname
const ASSET_DEST = new URL('../public/blog', import.meta.url).pathname

const files = readdirSync(SRC).filter((f) => f.endsWith('.md'))

// front-matter の素朴なパース(title / date / category / tags のみ対象)
function parseFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) throw new Error('front-matter not found')
  const body = raw.slice(m[0].length)
  const fm = {}
  const lines = m[1].split('\n')
  let currentKey = null
  for (const line of lines) {
    const item = line.match(/^\s+-\s+(.*)$/)
    if (item && currentKey) {
      fm[currentKey].push(item[1].trim())
      continue
    }
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) {
      const [, key, value] = kv
      if (value === '') {
        fm[key] = []
        currentKey = key
      } else {
        fm[key] = value.trim()
        currentKey = null
      }
    }
  }
  return { fm, body }
}

// ゼロ埋めなしの日時表記も含めて ISO 8601 (JST) に正規化する
function normalizeDate(dateStr) {
  const m = dateStr.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/,
  )
  if (!m) throw new Error(`unexpected date: ${dateStr}`)
  const [, y, mo, d, h, mi, s = '00'] = m
  const pad = (v) => v.padStart(2, '0')
  return {
    iso: `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}+09:00`,
    year: y,
    month: pad(mo),
  }
}

// 1st pass: メタ収集(post_link 解決用のファイル名・タイトル → URL マップ)
const posts = []
const refMap = new Map()
for (const file of files) {
  const slug = basename(file, '.md')
  const raw = readFileSync(join(SRC, file), 'utf8')
  const { fm, body } = parseFrontMatter(raw)
  const { iso, year, month } = normalizeDate(fm.date)
  const url = `/blog/${year}/${month}/${slug}/`
  posts.push({ slug, fm, body, iso, year, month, url })
  refMap.set(slug, url)
  refMap.set(fm.title, url)
}

// 2nd pass: 本文変換と書き出し
// 移行元で削除・改名された記事の生成物が残らないよう、出力先を作り直す
rmSync(DEST, { recursive: true, force: true })
rmSync(ASSET_DEST, { recursive: true, force: true })
mkdirSync(DEST, { recursive: true })
let assetDirs = 0
const warnings = []

for (const post of posts) {
  let body = post.body

  // 相対参照の画像を絶対パスへ(旧URL /blog/y/m/slug/<image> と同一のパスに配置している)
  body = body.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/|\/)([^)]+)\)/g,
    (_, alt, src) => {
      return `![${alt}](/blog/${post.year}/${post.month}/${post.slug}/${src})`
    },
  )

  body = body.replace(/\{%\s*(?:linkPreview|twitter)\s+(\S+)\s*%\}/g, '$1')

  body = body.replace(
    /\{%\s*youtube\s+(\S+)\s*%\}/g,
    '<iframe class="youtube-embed" src="https://www.youtube.com/embed/$1" title="YouTube" loading="lazy" allowfullscreen></iframe>',
  )

  body = body.replace(/\{%\s*link\s+(\S+)\s+(\S+)(?:\s+[^%]*)?%\}/g, '[$1]($2)')

  body = body.replace(
    /\{%\s*post_link\s+(\S+)\s+([^%]+?)\s*%\}/g,
    (_, ref, label) => {
      const url = refMap.get(ref)
      if (!url) {
        warnings.push(`${post.slug}: post_link unresolved: ${ref}`)
        return label
      }
      return `[${label}](${url})`
    },
  )

  const rest = body.match(/\{%[^%]*%\}/g)
  if (rest) warnings.push(`${post.slug}: unconverted tags: ${rest.join(', ')}`)

  const tags = (
    Array.isArray(post.fm.tags) ? post.fm.tags : [post.fm.tags]
  ).filter(Boolean)
  const fmOut = [
    '---',
    `title: ${JSON.stringify(post.fm.title)}`,
    `date: "${post.iso}"`,
    `category: ${JSON.stringify(post.fm.category ?? '')}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    '---',
    '',
  ].join('\n')

  writeFileSync(join(DEST, `${post.slug}.md`), fmOut + body)

  const assetSrc = join(SRC, post.slug)
  if (existsSync(assetSrc)) {
    const assetDest = join(ASSET_DEST, post.year, post.month, post.slug)
    mkdirSync(assetDest, { recursive: true })
    cpSync(assetSrc, assetDest, { recursive: true })
    assetDirs++
  }
}

console.log(`migrated: ${posts.length} posts, ${assetDirs} asset dirs`)
if (warnings.length) {
  console.log('warnings:')
  for (const w of warnings) console.log(`  - ${w}`)
}
