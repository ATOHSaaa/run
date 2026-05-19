import type { CollectionEntry } from 'astro:content';
import {
  ACTIVITY_MENU_MODIFIER_BY_SLUG,
  type ActivityMenuSlug,
} from '@/constants/activity-menus';
import {
  extractFirstCodeFenceInfo,
  parsePracticeLogBody,
  practiceLogMenuActivityModifier,
  shouldTransformFirstFence,
} from '../../practice-log-parse.mjs';

export function getActivityModifierFromPost(
  post: CollectionEntry<'blog'>,
): ReturnType<typeof practiceLogMenuActivityModifier> {
  const info = extractFirstCodeFenceInfo(post.body);
  if (!info || !shouldTransformFirstFence({ lang: info.lang, value: info.value })) {
    return null;
  }
  const parsed = parsePracticeLogBody(info.value ?? '');
  return practiceLogMenuActivityModifier(parsed.menu);
}

export function postMatchesActivityMenuSlug(
  post: CollectionEntry<'blog'>,
  menuSlug: ActivityMenuSlug,
): boolean {
  if (post.data.category !== 'Activities') return false;
  const modifier = ACTIVITY_MENU_MODIFIER_BY_SLUG[menuSlug];
  return getActivityModifierFromPost(post) === modifier;
}
