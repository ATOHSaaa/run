import satori from 'satori';
import sharp from 'sharp';
import type { CollectionEntry } from 'astro:content';
import { OG_HEIGHT, OG_WIDTH } from './constants';
import { getSiteHeaderStripPng } from './capture-site-header';
import { getOgFonts } from './fonts';
import { buildOgTemplate } from './template';

export async function generateBlogOgPng(
  entry: CollectionEntry<'blog'>,
): Promise<Uint8Array> {
  const headerPng = await getSiteHeaderStripPng();
  const headerMeta = await sharp(headerPng).metadata();
  const headerHeight = headerMeta.height;
  if (!headerHeight || headerHeight >= OG_HEIGHT) {
    throw new Error(
      `OGP ヘッダー画像の高さが不正です (${headerHeight ?? 'unknown'}px)。capture:og-header を再実行してください。`,
    );
  }

  const bodyHeight = OG_HEIGHT - headerHeight;
  const [fonts, element] = await Promise.all([getOgFonts(), buildOgTemplate(entry)]);
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: bodyHeight,
    fonts,
  });
  const bodyPng = await sharp(Buffer.from(svg)).png().toBuffer();

  const png = await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: headerPng, top: 0, left: 0 },
      { input: bodyPng, top: headerHeight, left: 0 },
    ])
    .png()
    .toBuffer();

  return new Uint8Array(png);
}
