import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(import.meta.env.SITE)).origin;
  const base = import.meta.env.BASE_URL;
  const sitemapUrl = new URL(`${base}sitemap-index.xml`, origin);
  const ogDisallow = `${base}og/`.replace(/\/{2,}/g, '/');

  const body = `User-agent: *
Allow: /

Disallow: ${ogDisallow}

Sitemap: ${sitemapUrl.href}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
