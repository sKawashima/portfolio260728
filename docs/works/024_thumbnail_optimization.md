# 024: Worksサムネイル画像の最適化

Issue: #24

## 何をしたか

- `astro:assets`(sharp)による画像最適化を導入
  - サムネイル12枚を `public/` → `src/content/works/images/` へ移動し、works スキーマの `thumbnail` を `image()` に変更
  - 一覧カード(`WorkItem.astro`): 幅640px WebP(retina用に2xも生成)
  - 詳細ページ(`works/[id].astro`): 幅1200px WebP(2xあり)
  - YouTube提供サムネは従来通り `<img>`(外部URLのため)
- `sharp` を依存に追加し、`pnpm.onlyBuiltDependencies` で build script を許可(CI対応)
- **未参照の原本画像の除去**: `image()` 経由の原寸PNG/JPGがHTML未参照のまま `dist/_astro/` にコピーされるため、CIのビルド後に検査付きで削除するステップを追加(参照が見つかれば失敗して気づける)

## 効果

- 一覧サムネ: **1枚 3〜18MB → 4KB〜176KB**(1x。2xでも最大508KB)
- dist 全体: 104MB → **28MB**

## 判断

- ブログ記事内の画像(`public/blog/`)は旧URL維持のため対象外(Issueに記載)
- `public/` の旧サムネは削除。デプロイの同期でサーバーからも消える(HTML参照は全て新方式に置換済み)

## 次のステップ

- マージ後、本番の一覧表示速度を確認
