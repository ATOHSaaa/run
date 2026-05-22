import fs from 'node:fs/promises';
import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import { getGearDisplayName, getPostDisplayTitle } from '@/utils/post-title';

/** リポジトリ直下。生成済み OGP をコミットして CI の再生成を避ける */
export const BLOG_OG_CACHE_DIR = path.join(process.cwd(), 'og-cache', 'blog');
const MANIFEST_PATH = path.join(BLOG_OG_CACHE_DIR, '.og-title-cache.json');

type OgTitleManifest = Record<string, string>;

/** OGP 再生成の判定に使うタイトル文字列（Gears は商品名＋記事タイトル） */
export function getBlogOgTitleCacheKey(entry: CollectionEntry<'blog'>): string {
  if (entry.data.category === 'Gears') {
    return `gears:${getGearDisplayName(entry.data)}|${getPostDisplayTitle(entry.data)}`;
  }
  return getPostDisplayTitle(entry.data);
}

function pngPath(slug: string): string {
  return path.join(BLOG_OG_CACHE_DIR, `${slug}.png`);
}

async function readManifest(): Promise<OgTitleManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
    return JSON.parse(raw) as OgTitleManifest;
  } catch {
    return {};
  }
}

async function writeManifest(manifest: OgTitleManifest): Promise<void> {
  await fs.mkdir(BLOG_OG_CACHE_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

export async function readCachedBlogOgPng(
  slug: string,
  titleKey: string,
): Promise<Uint8Array | null> {
  const manifest = await readManifest();
  if (manifest[slug] !== titleKey) return null;
  try {
    const buf = await fs.readFile(pngPath(slug));
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

export async function writeCachedBlogOgPng(
  slug: string,
  titleKey: string,
  png: Uint8Array,
): Promise<void> {
  const file = pngPath(slug);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, png);
  const manifest = await readManifest();
  manifest[slug] = titleKey;
  await writeManifest(manifest);
}
