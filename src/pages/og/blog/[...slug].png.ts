import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { prefetchAmazonProductImages } from '../../../../amazon-creators-products.mjs';
import { generateBlogOgPng } from '@/utils/og-image/generate-blog-og-png';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  await prefetchAmazonProductImages(posts);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateBlogOgPng(props.post);
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
