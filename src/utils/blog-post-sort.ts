import type { CollectionEntry } from 'astro:content';

/** `…-diary-activities` = 1本目（同日で最古）。`…-diary-activities-2` 以降は番号が大きいほど新しい。 */
export function getActivityDaySequence(slug: string): number {
  const m = slug.match(/diary-activities(?:-(\d+))?$/);
  if (!m) return 0;
  return m[1] ? parseInt(m[1], 10) : 1;
}

/** 公開日降順。同日の Activities は suffix 番号降順（`-2` が `-1` 相当の無印より上＝新しい）。 */
export function compareBlogPostsByPubDateDesc(
  a: CollectionEntry<'blog'>,
  b: CollectionEntry<'blog'>,
): number {
  const dateDiff = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  if (dateDiff !== 0) return dateDiff;

  if (a.data.category === 'Activities' && b.data.category === 'Activities') {
    return getActivityDaySequence(b.slug) - getActivityDaySequence(a.slug);
  }

  return a.slug.localeCompare(b.slug);
}

export function sortBlogPostsByPubDateDesc(
  posts: CollectionEntry<'blog'>[],
): CollectionEntry<'blog'>[] {
  return [...posts].sort(compareBlogPostsByPubDateDesc);
}

/** カレンダー同日セル内: 古い順（1本目 → 2本目 …） */
export function compareActivitiesSameDayAsc(
  a: CollectionEntry<'blog'>,
  b: CollectionEntry<'blog'>,
): number {
  return getActivityDaySequence(a.slug) - getActivityDaySequence(b.slug);
}
