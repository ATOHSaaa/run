/** トップ OGP 画像のパス（`src/pages/og/home.png.ts`） */
export function getHomeOgImagePath(): string {
  const base = import.meta.env.BASE_URL;
  const basePath = base.endsWith('/') ? base : `${base}/`;
  return `${basePath}og/home.png`.replace(/\/{2,}/g, '/');
}

/** 絶対 URL（`astro.config` の `site` と組み合わせて meta に渡す） */
export function getHomeOgImageUrl(site: URL | string): string {
  return new URL(getHomeOgImagePath(), site).href;
}
