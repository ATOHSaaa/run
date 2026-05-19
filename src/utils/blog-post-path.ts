import type { CollectionEntry } from 'astro:content';
import { BLOG_CATEGORY_SLUG, type BlogCategory } from '@/utils/blog-category-path';

/** `src/content/blog/{folder}/` のフォルダ名 */
export type BlogContentFolder = (typeof BLOG_CATEGORY_SLUG)[BlogCategory];

export function getBlogContentFolder(category: BlogCategory): BlogContentFolder {
  return BLOG_CATEGORY_SLUG[category];
}

/** 記事 entry の `id` からコンテンツフォルダ名を取得（例: `tips/foo.md` → `tips`） */
export function getBlogContentFolderFromId(id: string): string | undefined {
  const segment = id.split('/')[0];
  return segment || undefined;
}

export function assertBlogEntryFolder(entry: CollectionEntry<'blog'>): void {
  const expected = getBlogContentFolder(entry.data.category);
  const actual = getBlogContentFolderFromId(entry.id);
  if (actual !== expected) {
    throw new Error(
      `[blog] ${entry.id} は category: ${entry.data.category} ですが、フォルダは ${expected}/ に置いてください（現在: ${actual ?? '（ルート）'}/）`,
    );
  }
}

export function getBlogPostHref(base: string, slug: string): string {
  return `${base}blog/${slug}/`;
}
