import type { APIRoute } from 'astro';
import { generateHomeOgPng } from '@/utils/og-image/generate-home-og-png';

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await generateHomeOgPng();
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
