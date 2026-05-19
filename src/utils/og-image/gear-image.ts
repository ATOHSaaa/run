import type { CollectionEntry } from 'astro:content';
import { collectPrimaryAsinFromPost } from '../../../amazon-creators-products.mjs';
import { readPublicImageDataUrl } from './public-image';

/** Gears OGP 用の商品画像（data URL） */
export async function resolveGearOgImageDataUrl(
  entry: CollectionEntry<'blog'>,
): Promise<string | undefined> {
  const cover = entry.data.coverImage?.trim();
  if (cover) return readPublicImageDataUrl(cover);

  const asin = collectPrimaryAsinFromPost(entry);
  if (!asin) return undefined;

  for (const ext of ['jpg', 'png']) {
    const url = await readPublicImageDataUrl(`gears/amazon/${asin}.${ext}`);
    if (url) return url;
  }
  return undefined;
}
