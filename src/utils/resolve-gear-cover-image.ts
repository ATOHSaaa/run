import type { CollectionEntry } from 'astro:content';
import {
  collectPrimaryAsinFromPost,
  getAmazonProductImageSrc,
} from '../../amazon-creators-products.mjs';

export async function resolveGearCoverImageUrl(
  entry: CollectionEntry<'blog'>,
  base: string,
  placeholderUrl: string,
): Promise<string> {
  const raw = entry.data.coverImage?.trim();
  if (raw) {
    const rel = raw.startsWith('/') ? raw.slice(1) : raw;
    return `${base}${rel}`;
  }

  const asin = collectPrimaryAsinFromPost(entry);
  if (!asin) return placeholderUrl;

  const imageSrc = await getAmazonProductImageSrc(asin);
  if (!imageSrc) return placeholderUrl;

  const rel = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
  return `${base}${rel}`;
}
