/** 記事 OGP 画像のパス（`src/pages/og/blog/` のエンドポイント。PNG 本体は `og-cache/blog/` にキャッシュ） */
export function getBlogOgImagePath(slug: string): string {
  const base = import.meta.env.BASE_URL;
  const basePath = base.endsWith('/') ? base : `${base}/`;
  return `${basePath}og/blog/${slug}.png`.replace(/\/{2,}/g, '/');
}

/** 絶対 URL（`astro.config` の `site` と組み合わせて meta に渡す） */
export function getBlogOgImageUrl(site: URL | string, slug: string): string {
  return new URL(getBlogOgImagePath(slug), site).href;
}
