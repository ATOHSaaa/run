import type { CollectionEntry } from 'astro:content';

export const GOETOU_LAKE_TAG = '江津湖';

/** Activities 記事の本文・description に「江津湖」が含まれるか */
export function activityMentionsGoetouLake(
  body: string,
  description?: string,
): boolean {
  return body.includes(GOETOU_LAKE_TAG) || (description?.includes(GOETOU_LAKE_TAG) ?? false);
}

/** フロントマターの tags に、Activities の江津湖ルールを反映した配列を返す */
export function resolveBlogTags(entry: CollectionEntry<'blog'>): string[] {
  const tags = [...(entry.data.tags ?? [])];
  if (
    entry.data.category === 'Activities' &&
    activityMentionsGoetouLake(entry.body, entry.data.description) &&
    !tags.includes(GOETOU_LAKE_TAG)
  ) {
    tags.push(GOETOU_LAKE_TAG);
  }
  return tags;
}
