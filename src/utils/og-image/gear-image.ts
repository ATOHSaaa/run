import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import { collectPrimaryAsinFromPost } from '../../../amazon-creators-products.mjs';

async function readPublicImageDataUrl(relPath: string): Promise<string | undefined> {
  const normalized = relPath.replace(/^\/+/, '');
  const abs = path.join(process.cwd(), 'public', normalized);
  try {
    const buf = await readFile(abs);
    const ext = abs.endsWith('.png') ? 'png' : 'jpeg';
    return `data:image/${ext};base64,${buf.toString('base64')}`;
  } catch {
    return undefined;
  }
}

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
