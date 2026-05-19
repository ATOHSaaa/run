import satori from 'satori';
import sharp from 'sharp';
import type { CollectionEntry } from 'astro:content';
import { OG_HEIGHT, OG_WIDTH } from './constants';
import { getOgFonts } from './fonts';
import { buildOgTemplate } from './template';

export async function generateBlogOgPng(
  entry: CollectionEntry<'blog'>,
): Promise<Uint8Array> {
  const [fonts, element] = await Promise.all([getOgFonts(), buildOgTemplate(entry)]);
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
