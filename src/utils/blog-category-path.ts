import type { CollectionEntry } from 'astro:content';

export type BlogCategory = CollectionEntry<'blog'>['data']['category'];

/** URL セグメント（`category/[slug]/`） */
export const BLOG_CATEGORY_SLUG = {
  Activities: 'activities',
  Tips: 'tips',
  Gears: 'gears',
  News: 'news',
} as const satisfies Record<BlogCategory, string>;

export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUG)[BlogCategory];

/** URL slug → スキーマ上の category */
export const BLOG_SLUG_TO_CATEGORY: Record<BlogCategorySlug, BlogCategory> = {
  activities: 'Activities',
  tips: 'Tips',
  gears: 'Gears',
  news: 'News',
};

export function getBlogCategoryListHref(base: string, category: BlogCategory): string {
  const slug = BLOG_CATEGORY_SLUG[category];
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}category/${slug}/`;
}
