import type { CollectionEntry } from 'astro:content';

type BlogCategory = CollectionEntry<'blog'>['data']['category'];

const DISPLAY: Record<BlogCategory, string> = {
  Activities: 'Activities',
  Tips: 'Tips',
  Gears: 'Gears',
  News: 'お知らせ',
};

/** 画面表示用カテゴリ名（データの `category` は従来どおり） */
export function getCategoryDisplayLabel(category: BlogCategory): string {
  return DISPLAY[category];
}

/** カテゴリ pill の BEM 修飾子（`pill--{modifier}`） */
export function getCategoryPillModifier(category: BlogCategory): 'diary' | 'tips' | 'news' {
  if (category === 'Activities') return 'diary';
  if (category === 'News') return 'news';
  return 'tips';
}
