import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { prefetchAmazonProductImages } from '../../../../amazon-creators-products.mjs';
import {
  getBlogOgTitleCacheKey,
  readCachedBlogOgPng,
  writeCachedBlogOgPng,
} from '@/utils/og-image/blog-og-cache';
import { generateBlogOgPng } from '@/utils/og-image/generate-blog-og-png';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const gearsNeedingRegen = [];
  for (const post of posts) {
    if (post.data.category !== 'Gears') continue;
    const titleKey = getBlogOgTitleCacheKey(post);
    const cached = await readCachedBlogOgPng(post.slug, titleKey);
    if (!cached) gearsNeedingRegen.push(post);
  }
  if (gearsNeedingRegen.length > 0) {
    await prefetchAmazonProductImages(gearsNeedingRegen);
  }
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const titleKey = getBlogOgTitleCacheKey(post);
  let png = await readCachedBlogOgPng(post.slug, titleKey);
  if (!png) {
    png = await generateBlogOgPng(post);
    await writeCachedBlogOgPng(post.slug, titleKey, png);
  }
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
